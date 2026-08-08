using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/issues/{issueId}/comments")]
    [ApiController]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly FixItDbContext _context;

        public CommentsController(FixItDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetComments(int issueId)
        {
            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.IssueId == issueId)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.Content,
                    c.IsWorkNote,
                    c.CreatedAt,
                    UserId = c.UserId,
                    UserName = c.User.FullName,
                    UserRole = c.User.Role
                })
                .ToListAsync();

            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // Filter out work notes for students
            if (userRole == "STUDENT")
            {
                comments = comments.Where(c => !c.IsWorkNote).ToList();
            }

            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult> AddComment(int issueId, [FromBody] CommentRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var issue = await _context.Issues.FindAsync(issueId);
            if (issue == null) return NotFound();

            var comment = new Comment
            {
                IssueId = issueId,
                UserId = userId,
                Content = request.Content,
                IsWorkNote = request.IsWorkNote
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }

    public class CommentRequest
    {
        public string Content { get; set; } = string.Empty;
        public bool IsWorkNote { get; set; }
    }
}
