namespace backend.Models
{
    public class Issue
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        
        // Input Factors
        public string Urgency { get; set; } = "LOW";
        public int AffectedPeople { get; set; } = 1;
        
        // Calculated Priority
        public int PriorityScore { get; set; }
        public string PriorityLevel { get; set; } = "LOW";
        
        // Stored as JSON or separated string in DB
        public string PriorityFactors { get; set; } = string.Empty;
        
        // State
        public string Status { get; set; } = "PENDING";
        
        // Relations
        public int ReportedById { get; set; }
        public User? ReportedBy { get; set; }
        
        public int? AssignedToId { get; set; }
        public User? AssignedTo { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
    }
}
