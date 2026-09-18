namespace PanthersEsports.Api.Models;

public class Team
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string? CaptainUserId { get; set; }   // Firebase UID
    public string CaptainName { get; set; } = string.Empty;
    public string? CaptainPhone { get; set; }
    public string? CaptainUid { get; set; }      // Free Fire UID
    public string PlayersJson { get; set; } = "[]"; // JSON array of players
    public string? PaymentJson { get; set; }        // JSON payment info
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Slot> Slots { get; set; } = new List<Slot>();
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
    public ICollection<LeaderboardEntry> LeaderboardEntries { get; set; } = new List<LeaderboardEntry>();
}
