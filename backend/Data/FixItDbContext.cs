using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class FixItDbContext : DbContext
    {
        public FixItDbContext(DbContextOptions<FixItDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Issue> Issues { get; set; } = null!;
        public DbSet<IssueEvidence> IssueEvidences { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Location> Locations { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Email must be unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Issue Relations
            modelBuilder.Entity<Issue>()
                .HasOne(i => i.ReportedBy)
                .WithMany()
                .HasForeignKey(i => i.ReportedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Issue>()
                .HasOne(i => i.AssignedTo)
                .WithMany()
                .HasForeignKey(i => i.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);

            // Comment Relations
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Issue)
                .WithMany()
                .HasForeignKey(c => c.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // IssueEvidence Relations
            modelBuilder.Entity<IssueEvidence>()
                .HasOne(e => e.Issue)
                .WithMany(i => i.Evidence)
                .HasForeignKey(e => e.IssueId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<IssueEvidence>()
                .HasOne(e => e.UploadedBy)
                .WithMany()
                .HasForeignKey(e => e.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Issue.VerifiedBy Relation
            modelBuilder.Entity<Issue>()
                .HasOne(i => i.VerifiedBy)
                .WithMany()
                .HasForeignKey(i => i.VerifiedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
