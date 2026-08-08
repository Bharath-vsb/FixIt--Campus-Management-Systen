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
    }
}
