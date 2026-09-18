namespace PanthersEsports.Api.Models;

public class Tournament
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BannerUrl { get; set; } = string.Empty;
    public string Mode { get; set; } = "Squad";
    public string Map { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public decimal EntryFee { get; set; }
    public decimal PrizePool { get; set; }
    public int TotalSlots { get; set; } = 12;
    public string Status { get; set; } = "upcoming"; // upcoming | live | completed | cancelled
    public string? RoomId { get; set; }
    public string? RoomPassword { get; set; }
    public string Rules { get; set; } = string.Empty;
    public string? PrizeDistributionJson { get; set; }  // Stored as JSON string
    public string? ScheduleJson { get; set; }           // Stored as JSON string
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Slot> Slots { get; set; } = new List<Slot>();
    public ICollection<LeaderboardEntry> LeaderboardEntries { get; set; } = new List<LeaderboardEntry>();
    public ICollection<Match> Matches { get; set; } = new List<Match>();
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
