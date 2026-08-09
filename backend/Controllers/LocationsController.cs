using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LocationsController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public LocationsController(FixItDbContext context)
        {
            _context = context;
        }

        private string? GetUserRole()
        {
            return User.Claims.FirstOrDefault(c => c.Type.Contains("role", StringComparison.OrdinalIgnoreCase))?.Value;
        }

        // GET api/locations — any authenticated user (used in dropdowns)
        [HttpGet]
        public async Task<ActionResult> GetLocations()
        {
            var locs = await _context.Locations.OrderBy(l => l.Name).ToListAsync();

            var issueCounts = await _context.Issues
                .GroupBy(i => i.Location)
                .Select(g => new { Location = g.Key, Count = g.Count() })
                .ToListAsync();

            var result = locs.Select(l => new
            {
                l.Id,
                l.Name,
                l.Building,
                IssueCount = issueCounts.FirstOrDefault(ic => ic.Location == l.Name)?.Count ?? 0
            });

            return Ok(result);
        }

        // POST api/locations — Admin only
        [HttpPost]
        public async Task<ActionResult> CreateLocation([FromBody] LocationRequest request)
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Location name is required.");

            var exists = await _context.Locations.AnyAsync(l => l.Name == request.Name);
            if (exists)
                return Conflict("Location already exists.");

            var location = new Location
            {
                Name = request.Name.Trim(),
                Building = request.Building?.Trim() ?? ""
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLocations), new { id = location.Id }, location);
        }

        // PUT api/locations/{id} — Admin only
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateLocation(int id, [FromBody] LocationRequest request)
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            var location = await _context.Locations.FindAsync(id);
            if (location == null) return NotFound();

            location.Name = request.Name.Trim();
            location.Building = request.Building?.Trim() ?? location.Building;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/locations/{id} — Admin only (safe: checks for existing issues)
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLocation(int id)
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            var location = await _context.Locations.FindAsync(id);
            if (location == null) return NotFound();

            var hasIssues = await _context.Issues.AnyAsync(i => i.Location == location.Name);
            if (hasIssues)
                return Conflict("Cannot delete a location that has associated issues.");

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class LocationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Building { get; set; }
    }
}
