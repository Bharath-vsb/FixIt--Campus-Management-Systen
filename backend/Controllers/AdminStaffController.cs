using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/admin/staff")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminStaffController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public AdminStaffController(FixItDbContext context)
        {
            _context = context;
        }

        public class StaffManagementDto
        {
            public int Id { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string MobileNumber { get; set; } = string.Empty;
            public string AccountStatus { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public int ActiveIssuesCount { get; set; }
            public int ResolvedIssuesCount { get; set; }
        }

        // GET /api/admin/staff
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffManagementDto>>> GetStaff(string? status = null)
        {
            var query = _context.Users
                .Where(u => u.Role == "STAFF" && u.AccountStatus != "REMOVED")
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(u => u.AccountStatus == status);
            }

            var staffList = await query.ToListAsync();

            // Fetch issue counts
            var staffIds = staffList.Select(s => s.Id).ToList();
            
            var issueCounts = await _context.Issues
                .Where(i => i.AssignedToId != null && staffIds.Contains(i.AssignedToId.Value))
                .GroupBy(i => new { i.AssignedToId, i.Status })
                .Select(g => new { 
                    StaffId = g.Key.AssignedToId!.Value, 
                    Status = g.Key.Status, 
                    Count = g.Count() 
                })
                .ToListAsync();

            var dtos = staffList.Select(s =>
            {
                var staffIssueCounts = issueCounts.Where(c => c.StaffId == s.Id).ToList();
                var activeCount = staffIssueCounts
                    .Where(c => c.Status != "RESOLVED" && c.Status != "VERIFIED" && c.Status != "CLOSED")
                    .Sum(c => c.Count);
                var resolvedCount = staffIssueCounts
                    .Where(c => c.Status == "RESOLVED" || c.Status == "VERIFIED")
                    .Sum(c => c.Count);

                return new StaffManagementDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Email = s.Email,
                    MobileNumber = s.MobileNumber,
                    AccountStatus = s.AccountStatus,
                    CreatedAt = s.CreatedAt,
                    ActiveIssuesCount = activeCount,
                    ResolvedIssuesCount = resolvedCount
                };
            }).OrderByDescending(s => s.CreatedAt).ToList();

            return Ok(dtos);
        }

        // POST /api/admin/staff/{id}/approve
        [HttpPost("{id}/approve")]
        public async Task<ActionResult> ApproveStaff(int id)
        {
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "STAFF");
            if (staff == null) return NotFound("Staff member not found.");

            if (staff.AccountStatus == "PENDING_APPROVAL")
            {
                staff.AccountStatus = "ACTIVE";
                await _context.SaveChangesAsync();
                return Ok(new { message = "Staff member approved." });
            }
            return BadRequest("Staff member is not pending approval.");
        }

        // POST /api/admin/staff/{id}/disable
        [HttpPost("{id}/disable")]
        public async Task<ActionResult> DisableStaff(int id)
        {
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "STAFF");
            if (staff == null) return NotFound("Staff member not found.");

            if (staff.AccountStatus == "ACTIVE")
            {
                staff.AccountStatus = "DISABLED";
                await _context.SaveChangesAsync();
                return Ok(new { message = "Staff member disabled." });
            }
            return BadRequest("Staff member is not active.");
        }

        // POST /api/admin/staff/{id}/enable
        [HttpPost("{id}/enable")]
        public async Task<ActionResult> EnableStaff(int id)
        {
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "STAFF");
            if (staff == null) return NotFound("Staff member not found.");

            if (staff.AccountStatus == "DISABLED")
            {
                staff.AccountStatus = "ACTIVE";
                await _context.SaveChangesAsync();
                return Ok(new { message = "Staff member enabled." });
            }
            return BadRequest("Staff member is not disabled.");
        }

        // POST /api/admin/staff/{id}/remove
        [HttpPost("{id}/remove")]
        public async Task<ActionResult> RemoveStaff(int id)
        {
            var staff = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == "STAFF");
            if (staff == null) return NotFound("Staff member not found.");

            // Check for active assignments
            var activeIssuesCount = await _context.Issues
                .CountAsync(i => i.AssignedToId == id && i.Status != "RESOLVED" && i.Status != "VERIFIED" && i.Status != "CLOSED");

            if (activeIssuesCount > 0)
            {
                return BadRequest(new { message = "This staff member has active assigned issues. Reassign them before removing this account." });
            }

            staff.AccountStatus = "REMOVED";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Staff member removed." });
        }
    }
}
