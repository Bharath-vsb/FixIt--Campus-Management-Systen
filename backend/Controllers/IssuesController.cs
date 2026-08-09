using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using backend.Services;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IssuesController : ControllerBase
    {
        private readonly FixItDbContext _context;
        private readonly IFileStorageService _storage;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public IssuesController(FixItDbContext context, IWebHostEnvironment env, IConfiguration config, backend.Services.IFileStorageService storage)
        {
            _context = context;
            _env = env;
            _config = config;
            _storage = storage;
        }

        private string? GetUserRole() =>
            User.Claims.FirstOrDefault(c => c.Type.Contains("role", StringComparison.OrdinalIgnoreCase))?.Value;

        private string? GetUserId() =>
            User.Claims.FirstOrDefault(c =>
                (c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase) ||
                 c.Type.Contains("nameid", StringComparison.OrdinalIgnoreCase)) &&
                int.TryParse(c.Value, out _))?.Value;

        private string GetUploadsRoot() =>
            _config["UploadSettings:UploadsRoot"] ?? Path.Combine(_env.ContentRootPath, "uploads");

        // ─────────────────────────────────────────────────────────────────────
        // GET /api/issues
        // ─────────────────────────────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueDto>>> GetIssues([FromQuery] string? status, [FromQuery] string? priority)
        {
            var userRole = GetUserRole();
            var userIdStr = GetUserId();

            if (string.IsNullOrEmpty(userRole) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized("Missing claims");

            var query = _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .Include(i => i.VerifiedBy)
                .Include(i => i.Evidence).ThenInclude(e => e.UploadedBy)
                .AsQueryable();

            if (userRole == "STUDENT")
                query = query.Where(i => i.ReportedById == userId);
            else if (userRole == "STAFF")
                query = query.Where(i => i.AssignedToId == userId);
            // Admin sees all

            if (!string.IsNullOrEmpty(status))
                query = query.Where(i => i.Status == status);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(i => i.PriorityLevel == priority);

            var issues = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
            return Ok(issues.Select(i => MapToDto(i)));
        }

        // ─────────────────────────────────────────────────────────────────────
        // GET /api/issues/{id}
        // ─────────────────────────────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<ActionResult<IssueDto>> GetIssue(int id)
        {
            var issue = await _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .Include(i => i.VerifiedBy)
                .Include(i => i.Evidence).ThenInclude(e => e.UploadedBy)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (issue == null) return NotFound();

            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (userRole == "STUDENT" && issue.ReportedById != userId)
                return Forbid();

            return MapToDto(issue);
        }

        // ─────────────────────────────────────────────────────────────────────
        // POST /api/issues  (multipart/form-data — photo required)
        // ─────────────────────────────────────────────────────────────────────
        [HttpPost]
        [RequestSizeLimit(20_000_000)] // 20 MB max request
        public async Task<ActionResult<CreateIssueResponse>> CreateIssue(
            [FromForm] string title,
            [FromForm] string description,
            [FromForm] string category,
            [FromForm] string location,
            [FromForm] string urgency,
            [FromForm] int affectedPeople,
            IFormFile? photo)
        {
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("Missing user ID claim");

            // ── Validate required fields ──────────────────────────────────────
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(description) ||
                string.IsNullOrWhiteSpace(category) || string.IsNullOrWhiteSpace(location))
                return BadRequest("Title, description, category, and location are required.");

            // ── Validate photo (server-side) ──────────────────────────────────
            if (photo == null || photo.Length == 0)
                return BadRequest("A problem photo is required when reporting an issue.");

            var photoValidation = ValidateImageFile(photo);
            if (photoValidation != null) return BadRequest(photoValidation);

            // ── Priority Engine ───────────────────────────────────────────────
            int score = 10;
            var factors = new List<string> { "Base score (+10)" };

            if (urgency == "CRITICAL") { score += 40; factors.Add("Critical urgency (+40)"); }
            else if (urgency == "HIGH") { score += 20; factors.Add("High urgency (+20)"); }
            else if (urgency == "MEDIUM") { score += 10; factors.Add("Medium urgency (+10)"); }

            if (affectedPeople > 50) { score += 30; factors.Add(">50 people affected (+30)"); }
            else if (affectedPeople > 10) { score += 15; factors.Add(">10 people affected (+15)"); }

            string priorityLevel = score >= 70 ? "CRITICAL" :
                                   score >= 40 ? "HIGH" :
                                   score >= 20 ? "MEDIUM" : "LOW";

            // ── Duplicate detection ───────────────────────────────────────────
            var possibleDuplicate = await _context.Issues.AnyAsync(i =>
                i.Category == category &&
                i.Location == location &&
                i.Status != "RESOLVED" &&
                i.Status != "VERIFIED");

            // ── Save photo ──────────────────────────────────────────
            var (storageRef, fileName) = await _storage.SaveUploadedFileAsync(photo);

            // ── Create issue ──────────────────────────────────────────────────
            var issue = new Issue
            {
                Title = title,
                Description = description,
                Category = category,
                Location = location,
                Urgency = urgency,
                AffectedPeople = affectedPeople,
                PriorityScore = score,
                PriorityLevel = priorityLevel,
                PriorityFactors = JsonSerializer.Serialize(factors),
                Status = "PENDING",
                ReportedById = userId
            };

            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();

            // ── Create evidence record ────────────────────────────────────────
            var evidence = new IssueEvidence
            {
                IssueId = issue.Id,
                UploadedByUserId = userId,
                ImageType = "PROBLEM",
                FileName = fileName,
                ContentType = photo.ContentType,
                FileSize = photo.Length,
                StoragePath = storageRef
            };
            _context.IssueEvidences.Add(evidence);
            await _context.SaveChangesAsync();

            // Reload with includes
            issue = await _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .Include(i => i.VerifiedBy)
                .Include(i => i.Evidence).ThenInclude(e => e.UploadedBy)
                .FirstAsync(i => i.Id == issue.Id);

            return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, new CreateIssueResponse
            {
                Issue = MapToDto(issue),
                PossibleDuplicate = possibleDuplicate
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // PATCH /api/issues/{id}
        // ─────────────────────────────────────────────────────────────────────
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateIssue(int id, UpdateIssueStatusRequest request)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null) return NotFound();

            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (userRole == "STUDENT")
            {
                if (issue.ReportedById != userId) return Forbid();
                if (request.Status != null && request.Status != "VERIFIED") return Forbid();
                if (issue.Status != "RESOLVED") return Forbid();
            }
            else if (userRole == "STAFF")
            {
                if (issue.AssignedToId != userId) return Forbid();

                // Block RESOLVED if no resolution evidence exists
                if (request.Status == "RESOLVED")
                {
                    var hasResolutionEvidence = await _context.IssueEvidences
                        .AnyAsync(e => e.IssueId == id && e.ImageType == "RESOLUTION");
                    if (!hasResolutionEvidence)
                        return BadRequest("A resolution photo is required before marking this issue as resolved.");
                }
            }
            else if (userRole == "ADMIN")
            {
                if (request.AssignedToId.HasValue)
                {
                    issue.AssignedToId = request.AssignedToId.Value;
                    if (string.IsNullOrEmpty(request.Status) || request.Status == "PENDING")
                        issue.Status = "ASSIGNED";
                }
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                issue.Status = request.Status;
                if (request.Status == "RESOLVED" || request.Status == "VERIFIED")
                    issue.ResolvedAt = DateTime.UtcNow;
            }

            issue.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ─────────────────────────────────────────────────────────────────────
        // POST /api/issues/{id}/verify  (Admin only)
        // ─────────────────────────────────────────────────────────────────────
        [HttpPost("{id}/verify")]
        public async Task<ActionResult<IssueDto>> VerifyIssue(int id)
        {
            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();
            if (userRole != "ADMIN") return Forbid();

            var issue = await _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .Include(i => i.VerifiedBy)
                .Include(i => i.Evidence).ThenInclude(e => e.UploadedBy)
                .FirstOrDefaultAsync(i => i.Id == id);
            if (issue == null) return NotFound();

            if (issue.Status != "RESOLVED")
                return BadRequest("Issue must be RESOLVED before it can be verified.");

            var hasResolution = await _context.IssueEvidences
                .AnyAsync(e => e.IssueId == id && e.ImageType == "RESOLUTION");
            if (!hasResolution)
                return BadRequest("Resolution evidence is required before verification.");

            issue.Status = "VERIFIED";
            issue.VerifiedByUserId = userId;
            issue.VerifiedAt = DateTime.UtcNow;
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload VerifiedBy navigation
            await _context.Entry(issue).Reference(i => i.VerifiedBy).LoadAsync();

            return Ok(MapToDto(issue));
        }

        // ─────────────────────────────────────────────────────────────────────
        // POST /api/issues/{id}/rework  (Admin only)
        // ─────────────────────────────────────────────────────────────────────
        [HttpPost("{id}/rework")]
        public async Task<ActionResult<IssueDto>> RequestRework(int id, [FromBody] ReworkRequest request)
        {
            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();
            if (userRole != "ADMIN") return Forbid();

            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest("A reason is required when requesting rework.");

            var issue = await _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .Include(i => i.VerifiedBy)
                .Include(i => i.Evidence).ThenInclude(e => e.UploadedBy)
                .FirstOrDefaultAsync(i => i.Id == id);
            if (issue == null) return NotFound();

            if (issue.Status != "RESOLVED")
                return BadRequest("Rework can only be requested for RESOLVED issues.");

            issue.Status = "IN_PROGRESS";
            issue.ReworkNotes = request.Reason;
            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(MapToDto(issue));
        }

        // ─────────────────────────────────────────────────────────────────────
        // Helpers
        // ─────────────────────────────────────────────────────────────────────
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/webp" };
        private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

        private static string? ValidateImageFile(IFormFile file)
        {
            if (file.Length > MaxFileSize)
                return "File size must not exceed 5 MB.";

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                return "Please upload a JPG, PNG, or WEBP image.";

            var ct = file.ContentType.ToLowerInvariant();
            if (!AllowedContentTypes.Contains(ct))
                return "Invalid file type. Please upload a JPG, PNG, or WEBP image.";

            return null; // valid
        }

        internal IssueDto MapToDto(Issue i)
        {
            var dto = new IssueDto
            {
                Id = i.Id,
                Title = i.Title,
                Description = i.Description,
                Category = i.Category,
                Location = i.Location,
                Status = i.Status,
                PriorityLevel = i.PriorityLevel,
                PriorityScore = i.PriorityScore,
                PriorityFactors = string.IsNullOrEmpty(i.PriorityFactors)
                    ? new List<string>()
                    : JsonSerializer.Deserialize<List<string>>(i.PriorityFactors) ?? new List<string>(),
                AffectedPeople = i.AffectedPeople,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                ResolvedAt = i.ResolvedAt,
                ReportedById = i.ReportedById,
                ReportedByName = i.ReportedBy?.FullName ?? "Unknown",
                AssignedToId = i.AssignedToId,
                AssignedToName = i.AssignedTo?.FullName,
                VerifiedByName = i.VerifiedBy?.FullName,
                VerifiedAt = i.VerifiedAt,
                ReworkNotes = i.ReworkNotes,
            };

            if (i.Evidence != null)
            {
                foreach (var e in i.Evidence)
                {
                    var eDto = new EvidenceDto
                    {
                        Id = e.Id,
                        ImageType = e.ImageType,
                        Url = $"/api/issues/{i.Id}/evidence/{e.Id}/image",
                        UploadedByName = e.UploadedBy?.FullName ?? "Unknown",
                        CreatedAt = e.CreatedAt
                    };

                    if (e.ImageType == "PROBLEM") dto.ProblemEvidence.Add(eDto);
                    else if (e.ImageType == "RESOLUTION") dto.ResolutionEvidence.Add(eDto);
                }
            }

            return dto;
        }
    }
}
