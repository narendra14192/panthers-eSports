namespace PanthersEsports.Api.Models;

public class Registration
{
    public string Id { get; set; } = string.Empty;
    public string TournamentId { get; set; } = string.Empty;
    public string TournamentName { get; set; } = string.Empty;
    public int SlotNumber { get; set; }
    public string TeamId { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string TeamTag { get; set; } = string.Empty;
    public string? CaptainUserId { get; set; }
    public string CaptainName { get; set; } = string.Empty;
    public string? CaptainPhone { get; set; }
    public string? CaptainUid { get; set; }
    public string PlayersJson { get; set; } = "[]";
    // Payment
    public string? Utr { get; set; }          // 12-digit UPI UTR reference
    public decimal PaymentAmount { get; set; } = 50;
    public string PaymentMethod { get; set; } = "UPI";
    public string PaymentStatus { get; set; } = "pending_verification"; // pending_verification | verified | rejected
    // Status
    public string Status { get; set; } = "pending"; // pending | accepted | rejected
    public string AdminNotes { get; set; } = string.Empty;
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament? Tournament { get; set; }
    public Team? Team { get; set; }
}
