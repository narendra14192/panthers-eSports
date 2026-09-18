using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Models;
using PanthersEsports.Api.Services;

namespace PanthersEsports.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly PanthersDbContext _db;
    private readonly FirebaseAuthService _auth;

    public LeaderboardController(PanthersDbContext db, FirebaseAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/leaderboard?tournamentId={id}  (public)
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? tournamentId)
    {
        IQueryable<LeaderboardEntry> query = _db.Leaderboard;

        if (!string.IsNullOrEmpty(tournamentId))
            query = query.Where(lb => lb.TournamentId == tournamentId);
        else
            query = query.Where(lb => lb.TournamentId == null); // Global leaderboard

        var entries = await query
            .OrderByDescending(lb => lb.Points)
            .ThenByDescending(lb => lb.Kills)
            .ToListAsync();

        return Ok(entries.Select(MapToDto));
    }

    // POST /api/leaderboard/match-results  (admin)
    [HttpPost("match-results")]
    public async Task<IActionResult> SubmitMatchResults([FromBody] MatchResultsRequest req)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var matchId = $"match-{req.TournamentId}-r{req.RoundNumber}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

        // Save match record
        var match = new Match
        {
            Id = matchId,
            TournamentId = req.TournamentId,
            RoundNumber = req.RoundNumber,
            ResultDataJson = System.Text.Json.JsonSerializer.Serialize(req.Results),
            EnteredBy = req.AdminName ?? "PantherAdmin",
            CreatedAt = DateTime.UtcNow,
        };
        _db.Matches.Add(match);

        // Update leaderboard
        foreach (var result in req.Results)
        {
            var (placementPts, killPts, isBooyah) = CalculateScore(result.Placement, result.Kills);
            var totalPts = placementPts + killPts;

            // Tournament leaderboard
            var tEntryId = $"lb-{req.TournamentId}-{result.TeamId}";
            var tEntry = await _db.Leaderboard.FindAsync(tEntryId);
            if (tEntry != null)
            {
                tEntry.Points += totalPts;
                tEntry.Kills += result.Kills;
                tEntry.Wins += isBooyah ? 1 : 0;
                tEntry.MatchesPlayed++;
                tEntry.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.Leaderboard.Add(new LeaderboardEntry
                {
                    Id = tEntryId,
                    TournamentId = req.TournamentId,
                    TeamId = result.TeamId,
                    TeamName = result.TeamName,
                    TeamTag = result.TeamTag,
                    Points = totalPts,
                    Kills = result.Kills,
                    Wins = isBooyah ? 1 : 0,
                    MatchesPlayed = 1,
                    UpdatedAt = DateTime.UtcNow,
                });
            }

            // Global leaderboard
            var gEntryId = $"glb-{result.TeamId}";
            var gEntry = await _db.Leaderboard.FindAsync(gEntryId);
            if (gEntry != null)
            {
                gEntry.Points += totalPts;
                gEntry.Kills += result.Kills;
                gEntry.Wins += isBooyah ? 1 : 0;
                gEntry.MatchesPlayed++;
                gEntry.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.Leaderboard.Add(new LeaderboardEntry
                {
                    Id = gEntryId,
                    TournamentId = null,
                    TeamId = result.TeamId,
                    TeamName = result.TeamName,
                    TeamTag = result.TeamTag,
                    Points = totalPts,
                    Kills = result.Kills,
                    Wins = isBooyah ? 1 : 0,
                    MatchesPlayed = 1,
                    UpdatedAt = DateTime.UtcNow,
                });
            }
        }

        var booyah = req.Results.FirstOrDefault(r => r.Placement == 1);
        _db.AdminLogs.Add(new AdminLog
        {
            Id = $"log-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "MATCH_RESULTS_ENTERED",
            Details = $"Entered Round {req.RoundNumber} for {req.TournamentId}. Booyah: {booyah?.TeamName ?? "N/A"}.",
            Timestamp = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
        return Ok(new { match_id = matchId, message = "Match results saved successfully." });
    }

    private static (int placementPts, int killPts, bool isBooyah) CalculateScore(int placement, int kills)
    {
        int[] pts = { 0, 12, 9, 8, 7, 6, 5, 4, 3, 2, 1 };
        var placementPts = placement >= 1 && placement <= 10 ? pts[placement] : 0;
        return (placementPts, kills, placement == 1);
    }

    private async Task<bool> IsAuthAsync()
    {
        var token = FirebaseAuthService.ExtractBearerToken(Request);
        if (token == null) return false;
        return await _auth.VerifyTokenAsync(token) != null;
    }

    private static object MapToDto(LeaderboardEntry lb) => new
    {
        id = lb.Id,
        tournament_id = lb.TournamentId,
        team_id = lb.TeamId,
        team_name = lb.TeamName,
        team_tag = lb.TeamTag,
        points = lb.Points,
        kills = lb.Kills,
        wins = lb.Wins,
        matches_played = lb.MatchesPlayed,
        updated_at = lb.UpdatedAt,
    };
}

public class MatchResultsRequest
{
    public string TournamentId { get; set; } = string.Empty;
    public int RoundNumber { get; set; }
    public string? AdminName { get; set; }
    public List<MatchTeamResult> Results { get; set; } = new();
}

public class MatchTeamResult
{
    public string TeamId { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string TeamTag { get; set; } = string.Empty;
    public int Placement { get; set; }
    public int Kills { get; set; }
}
