namespace PanthersEsports.Api.Models;

public class LeaderboardEntry
{
    public string Id { get; set; } = string.Empty;
    public string? TournamentId { get; set; }   // null = global leaderboard
    public string TeamId { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string TeamTag { get; set; } = string.Empty;
    public int Points { get; set; }
    public int Kills { get; set; }
    public int Wins { get; set; }
    public int MatchesPlayed { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament? Tournament { get; set; }
    public Team? Team { get; set; }
}
