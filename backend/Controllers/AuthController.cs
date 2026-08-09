using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly FixItDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(FixItDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.MobileNumber))
            {
                return BadRequest(new { message = "Mobile number is required." });
            }

            if (request.Role == "ADMIN")
            {
                return BadRequest(new { message = "Admin registration is not allowed." });
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "An account with this email already exists." });
            }

            var status = request.Role == "STAFF" ? "PENDING_APPROVAL" : "ACTIVE";

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                MobileNumber = request.MobileNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                AccountStatus = status
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var responseDto = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                MobileNumber = user.MobileNumber,
                AccountStatus = user.AccountStatus
            };

            if (user.AccountStatus == "PENDING_APPROVAL")
            {
                // Do not issue JWT for pending staff
                return Ok(new AuthResponse { Token = "", User = responseDto });
            }

            var token = GenerateJwtToken(user);
            return Ok(new AuthResponse { Token = token, User = responseDto });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (user.AccountStatus == "PENDING_APPROVAL")
            {
                return Unauthorized(new { message = "Your staff account is awaiting admin approval." });
            }
            if (user.AccountStatus == "DISABLED" || user.AccountStatus == "REMOVED")
            {
                return Unauthorized(new { message = "Your staff account has been disabled. Please contact the administrator." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                    MobileNumber = user.MobileNumber,
                    AccountStatus = user.AccountStatus
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
