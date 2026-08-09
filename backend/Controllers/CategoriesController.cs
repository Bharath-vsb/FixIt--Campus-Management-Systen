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
    public class CategoriesController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public CategoriesController(FixItDbContext context)
        {
            _context = context;
        }

        private string? GetUserRole()
        {
            return User.Claims.FirstOrDefault(c => c.Type.Contains("role", StringComparison.OrdinalIgnoreCase))?.Value;
        }

        // GET api/categories — any authenticated user (used in dropdowns)
        [HttpGet]
        public async Task<ActionResult> GetCategories()
        {
            var cats = await _context.Categories.OrderBy(c => c.Name).ToListAsync();
            // Also enrich with live issue counts for Admin
            var issueCounts = await _context.Issues
                .GroupBy(i => i.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToListAsync();

            var result = cats.Select(c => new
            {
                c.Id,
                c.Name,
                c.Icon,
                IssueCount = issueCounts.FirstOrDefault(ic => ic.Category == c.Name)?.Count ?? 0
            });

            return Ok(result);
        }

        // POST api/categories — Admin only
        [HttpPost]
        public async Task<ActionResult> CreateCategory([FromBody] CategoryRequest request)
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Category name is required.");

            var exists = await _context.Categories.AnyAsync(c => c.Name == request.Name);
            if (exists)
                return Conflict("Category already exists.");

            var category = new Category
            {
                Name = request.Name.Trim(),
                Icon = request.Icon?.Trim() ?? "category"
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        // PUT api/categories/{id} — Admin only
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCategory(int id, [FromBody] CategoryRequest request)
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            category.Name = request.Name.Trim();
            if (!string.IsNullOrWhiteSpace(request.Icon))
                category.Icon = request.Icon.Trim();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/categories/{id} — Admin only (safe: checks for existing issues)
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var userRole = GetUserRole();
            if (userRole != "ADMIN") return Forbid();

            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            var hasIssues = await _context.Issues.AnyAsync(i => i.Category == category.Name);
            if (hasIssues)
                return Conflict("Cannot delete a category that has associated issues. Disable or rename it instead.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Icon { get; set; }
    }
}
