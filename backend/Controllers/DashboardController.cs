using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public DashboardController(FixItDbContext context)
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

        [HttpGet("admin")]
        public async Task<ActionResult> GetAdminStats()
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            var issues = await _context.Issues.ToListAsync();
            
            return Ok(new
            {
                totalIssues = issues.Count(i => i.Status != "RESOLVED" && i.Status != "VERIFIED"),
                pendingIssues = issues.Count(i => i.Status == "PENDING"),
                inProgressIssues = issues.Count(i => i.Status == "IN_PROGRESS"),
                resolvedIssues = issues.Count(i => (i.Status == "RESOLVED" || i.Status == "VERIFIED") && i.ResolvedAt >= DateTime.UtcNow.Date),
                criticalIssues = issues.Count(i => i.PriorityLevel == "CRITICAL" && i.Status != "RESOLVED" && i.Status != "VERIFIED"),
                assignedIssues = issues.Count(i => i.Status == "ASSIGNED")
            });
        }

        [HttpGet("staff")]
        public async Task<ActionResult> GetStaffStats()
        {
            var userIdStr = GetUserId();
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var issues = await _context.Issues.Where(i => i.AssignedToId == userId).ToListAsync();
            
            return Ok(new
            {
                totalIssues = issues.Count(i => i.Status != "RESOLVED" && i.Status != "VERIFIED"),
                pendingIssues = 0,
                inProgressIssues = issues.Count(i => i.Status == "IN_PROGRESS"),
                resolvedIssues = issues.Count(i => (i.Status == "RESOLVED" || i.Status == "VERIFIED") && i.ResolvedAt >= DateTime.UtcNow.Date),
                criticalIssues = issues.Count(i => i.PriorityLevel == "CRITICAL" && i.Status != "RESOLVED" && i.Status != "VERIFIED"),
                assignedIssues = issues.Count(i => i.Status == "ASSIGNED")
            });
        }
        [HttpGet("analytics")]
        public async Task<ActionResult> GetAnalytics()
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            var issues = await _context.Issues.ToListAsync();

            // Status breakdown
            var byStatus = new
            {
                total = issues.Count,
                pending = issues.Count(i => i.Status == "PENDING"),
                assigned = issues.Count(i => i.Status == "ASSIGNED"),
                inProgress = issues.Count(i => i.Status == "IN_PROGRESS"),
                resolved = issues.Count(i => i.Status == "RESOLVED"),
                verified = issues.Count(i => i.Status == "VERIFIED")
            };

            // Priority breakdown
            var byPriority = new
            {
                critical = issues.Count(i => i.PriorityLevel == "CRITICAL"),
                high = issues.Count(i => i.PriorityLevel == "HIGH"),
                medium = issues.Count(i => i.PriorityLevel == "MEDIUM"),
                low = issues.Count(i => i.PriorityLevel == "LOW")
            };

            // Category breakdown
            var byCategory = issues
                .GroupBy(i => i.Category)
                .Select(g => new { category = g.Key, count = g.Count() })
                .OrderByDescending(x => x.count)
                .ToList();

            // Location breakdown
            var byLocation = issues
                .GroupBy(i => i.Location)
                .Select(g => new { location = g.Key, count = g.Count() })
                .OrderByDescending(x => x.count)
                .ToList();

            // Average resolution time (in hours) for resolved issues
            var resolvedIssues = issues.Where(i => i.ResolvedAt.HasValue).ToList();
            double avgResolutionHours = resolvedIssues.Any()
                ? resolvedIssues.Average(i => (i.ResolvedAt!.Value - i.CreatedAt).TotalHours)
                : 0;

            return Ok(new
            {
                byStatus,
                byPriority,
                byCategory,
                byLocation,
                avgResolutionHours = Math.Round(avgResolutionHours, 1),
                totalResolved = resolvedIssues.Count
            });
        }
    }
}
