namespace PanthersEsports.Api.Models;

public class Match
{
    public string Id { get; set; } = string.Empty;
    public string TournamentId { get; set; } = string.Empty;
    public int RoundNumber { get; set; }
    public string ResultDataJson { get; set; } = "[]"; // JSON array of per-team results
    public string EnteredBy { get; set; } = "PantherAdmin";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament? Tournament { get; set; }
}
