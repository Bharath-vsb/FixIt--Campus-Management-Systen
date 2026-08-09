using System.Text.Json.Serialization;

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
        public string? ReworkNotes { get; set; }
    }

    public class CreateIssueResponse
    {
        public IssueDto Issue { get; set; } = new();
        public bool PossibleDuplicate { get; set; }
    }

    public class EvidenceDto
    {
        public int Id { get; set; }
        public string ImageType { get; set; } = string.Empty;
        /// <summary>Authenticated URL — never the physical path.</summary>
        public string Url { get; set; } = string.Empty;
        public string UploadedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
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

        // Verification
        public string? VerifiedByName { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? ReworkNotes { get; set; }

        // Evidence
        public List<EvidenceDto> ProblemEvidence { get; set; } = new();
        public List<EvidenceDto> ResolutionEvidence { get; set; } = new();
    }

    public class VerifyRequest { }

    public class ReworkRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}
