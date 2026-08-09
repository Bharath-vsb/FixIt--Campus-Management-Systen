using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/issues/{issueId}")]
    [ApiController]
    [Authorize]
    public class EvidenceController : ControllerBase
    {
        private readonly FixItDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public EvidenceController(FixItDbContext context, IWebHostEnvironment env, IConfiguration config)
        {
            _context = context;
            _env = env;
            _config = config;
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

        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/webp" };
        private const long MaxFileSize = 5 * 1024 * 1024;

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
            return null;
        }

        // ─────────────────────────────────────────────────────────────────────
        // POST /api/issues/{issueId}/evidence
        // Staff uploads resolution photo for their assigned issue
        // ─────────────────────────────────────────────────────────────────────
        [HttpPost("evidence")]
        [RequestSizeLimit(20_000_000)]
        public async Task<ActionResult> UploadResolutionEvidence(int issueId, IFormFile? photo)
        {
            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();
            if (userRole != "STAFF") return Forbid();

            var issue = await _context.Issues.FindAsync(issueId);
            if (issue == null) return NotFound("Issue not found.");

            if (issue.AssignedToId != userId)
                return Forbid("You can only upload evidence for issues assigned to you.");

            if (issue.Status == "RESOLVED" || issue.Status == "VERIFIED")
                return BadRequest("Cannot upload evidence — issue is already resolved or verified.");

            if (photo == null || photo.Length == 0)
                return BadRequest("A resolution photo is required.");

            var validationError = ValidateImageFile(photo);
            if (validationError != null) return BadRequest(validationError);

            // Save file
            var uploadsRoot = GetUploadsRoot();
            Directory.CreateDirectory(uploadsRoot);

            var ext = Path.GetExtension(photo.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var relativePath = $"uploads/{fileName}";
            var absolutePath = Path.Combine(uploadsRoot, fileName);

            await using var stream = new FileStream(absolutePath, FileMode.Create, FileAccess.Write);
            await photo.CopyToAsync(stream);

            // Store evidence record (relative path only)
            var evidence = new IssueEvidence
            {
                IssueId = issueId,
                UploadedByUserId = userId,
                ImageType = "RESOLUTION",
                FileName = fileName,
                ContentType = photo.ContentType,
                FileSize = photo.Length,
                StoragePath = relativePath
            };

            _context.IssueEvidences.Add(evidence);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                evidence.Id,
                evidence.ImageType,
                Url = $"/api/issues/{issueId}/evidence/{evidence.Id}/image",
                evidence.CreatedAt
            });
        }

        // ─────────────────────────────────────────────────────────────────────
        // GET /api/issues/{issueId}/evidence/{evidenceId}/image
        // Authenticated image retrieval — no public static directory
        // ─────────────────────────────────────────────────────────────────────
        [HttpGet("evidence/{evidenceId}/image")]
        public async Task<IActionResult> GetEvidenceImage(int issueId, int evidenceId)
        {
            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var evidence = await _context.IssueEvidences
                .Include(e => e.Issue)
                .FirstOrDefaultAsync(e => e.Id == evidenceId && e.IssueId == issueId);

            if (evidence == null) return NotFound();

            // Authorization
            var issue = evidence.Issue!;
            var authorized =
                userRole == "ADMIN" ||
                (userRole == "STUDENT" && issue.ReportedById == userId) ||
                (userRole == "STAFF" && issue.AssignedToId == userId);

            if (!authorized) return Forbid();

            // Resolve absolute path from relative stored path
            var uploadsRoot = GetUploadsRoot();
            var absolutePath = Path.Combine(uploadsRoot, evidence.FileName);

            if (!System.IO.File.Exists(absolutePath))
                return NotFound("Image file not found on server.");

            var stream = new FileStream(absolutePath, FileMode.Open, FileAccess.Read);
            return File(stream, evidence.ContentType, enableRangeProcessing: true);
        }
    }
}
