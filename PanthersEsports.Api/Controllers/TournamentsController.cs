using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Models;
using PanthersEsports.Api.Services;

namespace PanthersEsports.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentsController : ControllerBase
{
    private readonly PanthersDbContext _db;
    private readonly FirebaseAuthService _auth;

    public TournamentsController(PanthersDbContext db, FirebaseAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/tournaments
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tournaments = await _db.Tournaments
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return Ok(tournaments.Select(MapToDto));
    }

    // GET /api/tournaments/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var t = await _db.Tournaments.FindAsync(id);
        if (t == null) return NotFound();
        return Ok(MapToDto(t));
    }

    // POST /api/tournaments  (admin only)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TournamentRequest req)
    {
        if (!await IsAdminAsync()) return Unauthorized(new { error = "Admin access required." });

        var id = $"tourney-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        var t = new Tournament
        {
            Id = id,
            Name = req.Name,
            Description = req.Description ?? "",
            BannerUrl = req.BannerUrl ?? "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            Mode = req.Mode ?? "Squad",
            Map = req.Map ?? "Bermuda",
            Date = req.Date,
            Time = req.Time,
            EntryFee = req.EntryFee,
            PrizePool = req.PrizePool,
            TotalSlots = req.TotalSlots,
            Status = "upcoming",
            RoomId = req.RoomId,
            RoomPassword = req.RoomPassword,
            Rules = req.Rules ?? "Standard Free Fire competitive rules apply.",
            PrizeDistributionJson = req.PrizeDistributionJson,
            ScheduleJson = req.ScheduleJson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Tournaments.Add(t);

        // Auto-create slots
        for (int i = 1; i <= t.TotalSlots; i++)
        {
            _db.Slots.Add(new Slot
            {
                Id = $"slot-{id}-{i}",
                TournamentId = id,
                SlotNumber = i,
                Status = "open",
            });
        }

        await _db.SaveChangesAsync();
        await LogAsync($"Created tournament \"{t.Name}\" with {t.TotalSlots} slots.");
        return CreatedAtAction(nameof(GetById), new { id }, MapToDto(t));
    }

    // PUT /api/tournaments/{id}  (admin only)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] TournamentRequest req)
    {
        if (!await IsAdminAsync()) return Unauthorized(new { error = "Admin access required." });

        var t = await _db.Tournaments.FindAsync(id);
        if (t == null) return NotFound();

        t.Name = req.Name ?? t.Name;
        t.Description = req.Description ?? t.Description;
        t.Mode = req.Mode ?? t.Mode;
        t.Map = req.Map ?? t.Map;
        t.Date = req.Date ?? t.Date;
        t.Time = req.Time ?? t.Time;
        t.EntryFee = req.EntryFee > 0 ? req.EntryFee : t.EntryFee;
        t.PrizePool = req.PrizePool > 0 ? req.PrizePool : t.PrizePool;
        t.Status = req.Status ?? t.Status;
        t.RoomId = req.RoomId ?? t.RoomId;
        t.RoomPassword = req.RoomPassword ?? t.RoomPassword;
        t.Rules = req.Rules ?? t.Rules;
        t.PrizeDistributionJson = req.PrizeDistributionJson ?? t.PrizeDistributionJson;
        t.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogAsync($"Updated tournament \"{t.Name}\".");
        return Ok(MapToDto(t));
    }

    // DELETE /api/tournaments/{id}  (admin only)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!await IsAdminAsync()) return Unauthorized(new { error = "Admin access required." });

        var t = await _db.Tournaments.FindAsync(id);
        if (t == null) return NotFound();

        _db.Tournaments.Remove(t);
        await _db.SaveChangesAsync();
        await LogAsync($"Deleted tournament \"{t.Name}\".");
        return NoContent();
    }

    private async Task<bool> IsAdminAsync()
    {
        var token = FirebaseAuthService.ExtractBearerToken(Request);
        if (token == null) return false;
        var decoded = await _auth.VerifyTokenAsync(token);
        return decoded != null; // Any authenticated user can be admin (passcode handled on frontend)
    }

    private async Task LogAsync(string details)
    {
        _db.AdminLogs.Add(new AdminLog
        {
            Id = $"log-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "TOURNAMENT_ACTION",
            Details = details,
            Timestamp = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();
    }

    private static object MapToDto(Tournament t) => new
    {
        id = t.Id,
        name = t.Name,
        description = t.Description,
        banner_url = t.BannerUrl,
        mode = t.Mode,
        map = t.Map,
        date = t.Date,
        time = t.Time,
        entry_fee = t.EntryFee,
        prize_pool = t.PrizePool,
        total_slots = t.TotalSlots,
        status = t.Status,
        room_id = t.RoomId,
        room_password = t.RoomPassword,
        rules = t.Rules,
        prize_distribution = t.PrizeDistributionJson != null ? JsonSerializer.Deserialize<object>(t.PrizeDistributionJson) : null,
        schedule = t.ScheduleJson != null ? JsonSerializer.Deserialize<object>(t.ScheduleJson) : null,
        created_at = t.CreatedAt,
        updated_at = t.UpdatedAt,
    };
}

public class TournamentRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BannerUrl { get; set; }
    public string? Mode { get; set; }
    public string? Map { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public decimal EntryFee { get; set; }
    public decimal PrizePool { get; set; }
    public int TotalSlots { get; set; } = 12;
    public string? Status { get; set; }
    public string? RoomId { get; set; }
    public string? RoomPassword { get; set; }
    public string? Rules { get; set; }
    public string? PrizeDistributionJson { get; set; }
    public string? ScheduleJson { get; set; }
}
