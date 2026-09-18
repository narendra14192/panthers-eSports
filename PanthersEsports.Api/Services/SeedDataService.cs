using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Models;

namespace PanthersEsports.Api.Services;

/// <summary>
/// Seeds the database with the Panthers Tri-Map Championship on first startup.
/// Runs only if no tournaments exist yet.
/// </summary>
public class SeedDataService
{
    private readonly PanthersDbContext _db;
    private readonly ILogger<SeedDataService> _logger;

    public SeedDataService(PanthersDbContext db, ILogger<SeedDataService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        // Only seed if no tournaments exist
        if (await _db.Tournaments.AnyAsync()) return;

        _logger.LogInformation("🌱 Seeding initial Panthers Esports data...");

        // ── Seed initial teams ───────────────────────────────────────────────
        var teams = new[]
        {
            new Team { Id = "team-1", Name = "Panther Elites", Tag = "PNTR", CaptainName = "Aman \"Shadow\" Verma", CaptainPhone = "+91 98765 43210", CaptainUid = "182947192", CaptainUserId = "user-player-1", PlayersJson = JsonSerializer.Serialize(new[] { new { name="PNTR Shadow", uid="182947192", role="Captain / Rusher" }, new { name="PNTR Venom", uid="293847102", role="Sniper" }, new { name="PNTR Blaze", uid="482910394", role="Flanker" }, new { name="PNTR Ghost", uid="958271039", role="Support" } }) },
            new Team { Id = "team-2", Name = "Viper Strike Esports", Tag = "VPR", CaptainName = "Rohan \"Viper\" Das", CaptainPhone = "+91 98111 22233", CaptainUid = "381940182", PlayersJson = JsonSerializer.Serialize(new[] { new { name="VPR Viper", uid="381940182", role="Captain" }, new { name="VPR Toxic", uid="849201948", role="Rusher" }, new { name="VPR Cobra", uid="748291048", role="Support" }, new { name="VPR Acid", uid="638201948", role="Sniper" } }) },
            new Team { Id = "team-3", Name = "Soul Reapers", Tag = "SOUL", CaptainName = "Aarav \"Soul\" Mehta", CaptainPhone = "+91 70123 45678", CaptainUid = "573829104", PlayersJson = JsonSerializer.Serialize(new[] { new { name="Soul Dark", uid="573829104", role="Captain" }, new { name="Soul Reaper", uid="492817364", role="Rusher" }, new { name="Soul Phantom", uid="638291047", role="Sniper" }, new { name="Soul Shade", uid="729301847", role="Support" } }) },
        };
        _db.Teams.AddRange(teams);

        // ── Seed Tournament ──────────────────────────────────────────────────
        const string tournamentId = "tourney-panthers-tri-map";
        var tournament = new Tournament
        {
            Id = tournamentId,
            Name = "Panthers Tri-Map Championship — 3 Matches Back-to-Back",
            Description = "The ultimate Free Fire competitive test! 12 slots battling across Bermuda, Purgatory, and Kalahari in back-to-back matches. Strict Esports Rules Only.",
            BannerUrl = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            Mode = "Squad / Duo",
            Map = "Bermuda, Purgatory & Kalahari",
            Date = "2026-09-22",
            Time = "19:00",
            EntryFee = 50,
            PrizePool = 400,
            TotalSlots = 12,
            Status = "upcoming",
            RoomId = "8821941",
            RoomPassword = "PANTHERS_ESPORTS",
            Rules = "1. ESPORTS RULES ONLY - Gun skin attributes strictly OFF.\n2. NO EMULATORS/IPADS - Mobile only.\n3. 3 MATCHES: Bermuda, Purgatory, Kalahari.\n4. SCORING: 1st=12pts, 2nd=9pts, 3rd=8pts... Kill=1pt.\n5. POV Recording mandatory.\n6. Anti-cheat: zero tolerance.",
            PrizeDistributionJson = JsonSerializer.Serialize(new Dictionary<string, string> { { "1st", "₹200 (Winner)" }, { "2nd", "₹130 (Runner Up)" }, { "3rd", "₹70 (3rd Place)" } }),
            ScheduleJson = JsonSerializer.Serialize(new[] {
                new { match = 1, map = "Bermuda", time = "19:00 IST", description = "Opening Drop" },
                new { match = 2, map = "Purgatory", time = "19:45 IST", description = "Mid-Series Skirmish" },
                new { match = 3, map = "Kalahari", time = "20:30 IST", description = "Desert Finale" }
            }),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Tournaments.Add(tournament);

        // ── Seed Slots (12 slots, first 3 pre-booked) ────────────────────────
        var slots = new List<Slot>();
        var preBooked = new[] {
            (1, "team-1"), (2, "team-2"), (3, "team-3")
        };

        for (int i = 1; i <= 12; i++)
        {
            var pre = Array.Find(preBooked, p => p.Item1 == i);
            slots.Add(new Slot
            {
                Id = $"slot-{tournamentId}-{i}",
                TournamentId = tournamentId,
                SlotNumber = i,
                TeamId = pre.Item1 != 0 ? pre.Item2 : null,
                Status = pre.Item1 != 0 ? "booked" : "open",
                BookedAt = pre.Item1 != 0 ? DateTime.UtcNow : null,
            });
        }
        _db.Slots.AddRange(slots);

        // ── Seed initial leaderboard entries ─────────────────────────────────
        _db.Leaderboard.AddRange(new[]
        {
            new LeaderboardEntry { Id = "lb-tourney-team-1", TournamentId = tournamentId, TeamId = "team-1", TeamName = "Panther Elites", TeamTag = "PNTR", Points = 38, Kills = 14, Wins = 1, MatchesPlayed = 2 },
            new LeaderboardEntry { Id = "lb-tourney-team-2", TournamentId = tournamentId, TeamId = "team-2", TeamName = "Viper Strike Esports", TeamTag = "VPR", Points = 30, Kills = 10, Wins = 1, MatchesPlayed = 2 },
            new LeaderboardEntry { Id = "lb-tourney-team-3", TournamentId = tournamentId, TeamId = "team-3", TeamName = "Soul Reapers", TeamTag = "SOUL", Points = 25, Kills = 8, Wins = 0, MatchesPlayed = 2 },
            new LeaderboardEntry { Id = "glb-team-1", TournamentId = null, TeamId = "team-1", TeamName = "Panther Elites", TeamTag = "PNTR", Points = 38, Kills = 14, Wins = 1, MatchesPlayed = 2 },
            new LeaderboardEntry { Id = "glb-team-2", TournamentId = null, TeamId = "team-2", TeamName = "Viper Strike Esports", TeamTag = "VPR", Points = 30, Kills = 10, Wins = 1, MatchesPlayed = 2 },
            new LeaderboardEntry { Id = "glb-team-3", TournamentId = null, TeamId = "team-3", TeamName = "Soul Reapers", TeamTag = "SOUL", Points = 25, Kills = 8, Wins = 0, MatchesPlayed = 2 },
        });

        await _db.SaveChangesAsync();
        _logger.LogInformation("✅ Database seeded successfully.");
    }
}
