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
    public class StaffController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public StaffController(FixItDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> GetAllStaff()
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole != "ADMIN") return Forbid();

            var staffUsers = await _context.Users
                .Where(u => u.Role == "STAFF")
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    // Calculate assigned issues directly
                    AssignedCount = _context.Issues.Count(i => i.AssignedToId == u.Id && i.Status != "RESOLVED" && i.Status != "VERIFIED"),
                    ResolvedCount = _context.Issues.Count(i => i.AssignedToId == u.Id && (i.Status == "RESOLVED" || i.Status == "VERIFIED")),
                })
                .ToListAsync();

            var result = staffUsers.Select(s => new
            {
                s.Id,
                s.FullName,
                s.Email,
                Status = s.AssignedCount > 2 ? "Busy" : "Available", // Simple derived status
                s.AssignedCount,
                s.ResolvedCount
            });

            return Ok(result);
        }
    }
}
