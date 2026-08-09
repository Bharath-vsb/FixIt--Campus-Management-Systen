namespace backend.Models
{
    public class IssueEvidence
    {
        public int Id { get; set; }

        public int IssueId { get; set; }
        public Issue? Issue { get; set; }

        public int UploadedByUserId { get; set; }
        public User? UploadedBy { get; set; }

        /// <summary>PROBLEM or RESOLUTION</summary>
        public string ImageType { get; set; } = string.Empty;

        /// <summary>Server-generated GUID-based filename e.g. "abc123.jpg"</summary>
        public string FileName { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        /// <summary>
        /// Relative path stored in DB e.g. "uploads/abc123.jpg".
        /// Backend resolves absolute path using configured upload root.
        /// Never exposed to clients.
        /// </summary>
        public string StoragePath { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
