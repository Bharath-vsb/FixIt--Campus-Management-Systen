using backend.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace backend.Data
{
    public static class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new FixItDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<FixItDbContext>>()))
            {
                if (context.Users.Any())
                {
                    return;   // DB has been seeded
                }

                context.Users.AddRange(
                    new User
                    {
                        FullName = "Alex Student",
                        Email = "alex@student.edu",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student123!"),
                        Role = "STUDENT",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        FullName = "John Doe",
                        Email = "john.doe@campus.edu",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff123!"),
                        Role = "STAFF",
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        FullName = "Admin User",
                        Email = "admin@campus.edu",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                        Role = "ADMIN",
                        CreatedAt = DateTime.UtcNow
                    }
                );
                
                // Optional: Seed initial categories and locations
                context.Categories.AddRange(
                    new Category { Name = "Plumbing", Icon = "plumbing" },
                    new Category { Name = "Electrical", Icon = "electrical_services" },
                    new Category { Name = "HVAC", Icon = "hvac" }
                );

                context.Locations.AddRange(
                    new Location { Name = "Hostel A", Building = "Residential" },
                    new Location { Name = "Main Library", Building = "Academic" }
                );

                context.SaveChanges();
            }
        }
    }
}
