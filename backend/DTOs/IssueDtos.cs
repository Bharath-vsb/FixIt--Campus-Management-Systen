namespace backend.DTOs
{
    public class CreateIssueRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Urgency { get; set; } = "LOW";
        public int AffectedPeople { get; set; } = 1;
    }

    public class UpdateIssueStatusRequest
    {
        public string? Status { get; set; }
        public int? AssignedToId { get; set; }
    }

    public class CreateIssueResponse
    {
        public IssueDto Issue { get; set; } = new();
        public bool PossibleDuplicate { get; set; }
    }

    public class IssueDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PriorityLevel { get; set; } = string.Empty;
        public int PriorityScore { get; set; }
        public List<string> PriorityFactors { get; set; } = new();
        public int AffectedPeople { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        
        public int ReportedById { get; set; }
        public string ReportedByName { get; set; } = string.Empty;
        
        public int? AssignedToId { get; set; }
        public string? AssignedToName { get; set; }
    }
}
