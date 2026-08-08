using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class IssuesController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public IssuesController(FixItDbContext context)
        {
            _context = context;
        }

        private string? GetUserRole()
        {
            return User.Claims.FirstOrDefault(c => c.Type.Contains("role", StringComparison.OrdinalIgnoreCase))?.Value;
        }

        private string? GetUserId()
        {
            return User.Claims.FirstOrDefault(c => (c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase) || c.Type.Contains("nameid", StringComparison.OrdinalIgnoreCase)) && int.TryParse(c.Value, out _))?.Value;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IssueDto>>> GetIssues([FromQuery] string? status)
        {
            var userRole = GetUserRole();
            var userIdStr = GetUserId();

            if (string.IsNullOrEmpty(userRole) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized("Missing claims");
            }

            var query = _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .AsQueryable();

            if (userRole == "STUDENT")
            {
                query = query.Where(i => i.ReportedById == userId);
            }
            else if (userRole == "STAFF")
            {
                query = query.Where(i => i.AssignedToId == userId);
            }
            // Admin sees all

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Status == status);
            }

            var issues = await query
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(issues.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IssueDto>> GetIssue(int id)
        {
            var issue = await _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (issue == null)
            {
                return NotFound();
            }

            var userRole = GetUserRole();
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            if (userRole == "STUDENT" && issue.ReportedById != userId)
            {
                return Forbid();
            }

            if (userRole == "STAFF" && issue.AssignedToId != userId)
            {
                // Can still view, maybe they want to see details before taking it? But let's restrict to assigned or admin
                // For MVP, staff can view any issue to potentially assign it to themselves, so no forbid here.
            }

            return MapToDto(issue);
        }

        [HttpPost]
        public async Task<ActionResult<CreateIssueResponse>> CreateIssue(CreateIssueRequest request)
        {
            var userIdStr = GetUserId();

            if (!int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized("Missing user ID claim");
            } 
            
            // Simple Priority Engine logic
            int score = 10;
            var factors = new List<string> { "Base score (+10)" };

            if (request.Urgency == "CRITICAL") { score += 40; factors.Add("Critical urgency (+40)"); }
            else if (request.Urgency == "HIGH") { score += 20; factors.Add("High urgency (+20)"); }
            else if (request.Urgency == "MEDIUM") { score += 10; factors.Add("Medium urgency (+10)"); }

            if (request.AffectedPeople > 50) { score += 30; factors.Add(">50 people affected (+30)"); }
            else if (request.AffectedPeople > 10) { score += 15; factors.Add(">10 people affected (+15)"); }

            string priorityLevel = score >= 70 ? "CRITICAL" :
                                   score >= 40 ? "HIGH" :
                                   score >= 20 ? "MEDIUM" : "LOW";

            // Simple duplicate detection
            var possibleDuplicate = await _context.Issues.AnyAsync(i => 
                i.Category == request.Category && 
                i.Location == request.Location && 
                i.Status != "RESOLVED" && 
                i.Status != "VERIFIED");

            var issue = new Issue
            {
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Location = request.Location,
                Urgency = request.Urgency,
                AffectedPeople = request.AffectedPeople,
                PriorityScore = score,
                PriorityLevel = priorityLevel,
                PriorityFactors = JsonSerializer.Serialize(factors),
                Status = "PENDING",
                ReportedById = userId
            };

            _context.Issues.Add(issue);
            await _context.SaveChangesAsync();

            // Reload with includes
            issue = await _context.Issues
                .Include(i => i.ReportedBy)
                .Include(i => i.AssignedTo)
                .FirstAsync(i => i.Id == issue.Id);

            return CreatedAtAction(nameof(GetIssue), new { id = issue.Id }, new CreateIssueResponse
            {
                Issue = MapToDto(issue),
                PossibleDuplicate = possibleDuplicate
            });
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateIssue(int id, UpdateIssueStatusRequest request)
        {
            var issue = await _context.Issues.FindAsync(id);
            if (issue == null) return NotFound();

            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            // Authorization rules
            if (userRole == "STUDENT")
            {
                if (issue.ReportedById != userId) return Forbid();
                if (request.Status != null && request.Status != "VERIFIED" || issue.Status != "RESOLVED") return Forbid();
            }
            else if (userRole == "STAFF")
            {
                if (issue.AssignedToId != userId) return Forbid();
            }
            else if (userRole == "ADMIN")
            {
                if (request.AssignedToId.HasValue)
                {
                    issue.AssignedToId = request.AssignedToId.Value;
                    if (string.IsNullOrEmpty(request.Status) || request.Status == "PENDING")
                    {
                        issue.Status = "ASSIGNED";
                    }
                }
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                issue.Status = request.Status;
                if (request.Status == "RESOLVED" || request.Status == "VERIFIED")
                {
                    issue.ResolvedAt = DateTime.UtcNow;
                }
            }

            issue.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private IssueDto MapToDto(Issue i)
        {
            return new IssueDto
            {
                Id = i.Id,
                Title = i.Title,
                Description = i.Description,
                Category = i.Category,
                Location = i.Location,
                Status = i.Status,
                PriorityLevel = i.PriorityLevel,
                PriorityScore = i.PriorityScore,
                PriorityFactors = string.IsNullOrEmpty(i.PriorityFactors) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(i.PriorityFactors) ?? new List<string>(),
                AffectedPeople = i.AffectedPeople,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                ResolvedAt = i.ResolvedAt,
                ReportedById = i.ReportedById,
                ReportedByName = i.ReportedBy?.FullName ?? "Unknown",
                AssignedToId = i.AssignedToId,
                AssignedToName = i.AssignedTo?.FullName
            };
        }
    }
}
