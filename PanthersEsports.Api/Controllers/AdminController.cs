using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Services;

namespace PanthersEsports.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly PanthersDbContext _db;
    private readonly FirebaseAuthService _auth;

    public AdminController(PanthersDbContext db, FirebaseAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/admin/logs  (admin)
    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] int limit = 50)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var logs = await _db.AdminLogs
            .OrderByDescending(l => l.Timestamp)
            .Take(limit)
            .ToListAsync();

        return Ok(logs.Select(l => new
        {
            id = l.Id,
            admin_name = l.AdminName,
            action = l.Action,
            details = l.Details,
            timestamp = l.Timestamp,
        }));
    }

    // GET /api/admin/teams  (admin)
    [HttpGet("teams")]
    public async Task<IActionResult> GetTeams()
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var teams = await _db.Teams.OrderByDescending(t => t.CreatedAt).ToListAsync();
        return Ok(teams.Select(t => new
        {
            id = t.Id,
            name = t.Name,
            tag = t.Tag,
            captain_name = t.CaptainName,
            captain_phone = t.CaptainPhone,
            captain_uid = t.CaptainUid,
            captain_user_id = t.CaptainUserId,
            players = t.PlayersJson,
            payment = t.PaymentJson,
            created_at = t.CreatedAt,
        }));
    }

    // GET /api/admin/matches?tournamentId={id}  (admin)
    [HttpGet("matches")]
    public async Task<IActionResult> GetMatches([FromQuery] string? tournamentId)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var query = _db.Matches.AsQueryable();
        if (!string.IsNullOrEmpty(tournamentId))
            query = query.Where(m => m.TournamentId == tournamentId);

        var matches = await query.OrderByDescending(m => m.CreatedAt).ToListAsync();
        return Ok(matches.Select(m => new
        {
            id = m.Id,
            tournament_id = m.TournamentId,
            round_number = m.RoundNumber,
            result_data = m.ResultDataJson,
            entered_by = m.EnteredBy,
            created_at = m.CreatedAt,
        }));
    }

    // PUT /api/admin/slots/{id}/checkin  (admin)
    [HttpPut("slots/{id}/checkin")]
    public async Task<IActionResult> ToggleCheckIn(string id)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var slot = await _db.Slots.FindAsync(id);
        if (slot == null) return NotFound();

        slot.Status = slot.Status == "checked_in" ? "booked" : "checked_in";
        slot.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { id = slot.Id, status = slot.Status });
    }

    // PUT /api/admin/slots/{id}/free  (admin)
    [HttpPut("slots/{id}/free")]
    public async Task<IActionResult> FreeSlot(string id)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var slot = await _db.Slots.FindAsync(id);
        if (slot == null) return NotFound();

        slot.TeamId = null;
        slot.Status = "open";
        slot.BookedAt = null;
        slot.PaymentStatus = null;
        slot.UpdatedAt = DateTime.UtcNow;

        _db.AdminLogs.Add(new Models.AdminLog
        {
            Id = $"log-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "SLOT_REVOKED",
            Details = $"Freed Slot #{slot.SlotNumber} in tournament {slot.TournamentId}.",
            Timestamp = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
        return Ok(new { id = slot.Id, status = slot.Status });
    }

    // PUT /api/admin/tournaments/{id}/room  (admin)
    [HttpPut("tournaments/{id}/room")]
    public async Task<IActionResult> UpdateRoom(string id, [FromBody] RoomRequest req)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var t = await _db.Tournaments.FindAsync(id);
        if (t == null) return NotFound();

        t.RoomId = req.RoomId;
        t.RoomPassword = req.RoomPassword;
        t.UpdatedAt = DateTime.UtcNow;

        _db.AdminLogs.Add(new Models.AdminLog
        {
            Id = $"log-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "ROOM_CREDENTIALS_UPDATED",
            Details = $"Room ID & password updated for tournament {id}.",
            Timestamp = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
        return Ok(new { room_id = t.RoomId, room_password = t.RoomPassword });
    }

    // PUT /api/admin/tournaments/{id}/status  (admin)
    [HttpPut("tournaments/{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] TournamentStatusRequest req)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var t = await _db.Tournaments.FindAsync(id);
        if (t == null) return NotFound();

        t.Status = req.Status;
        t.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { status = t.Status });
    }

    private async Task<bool> IsAuthAsync()
    {
        var token = FirebaseAuthService.ExtractBearerToken(Request);
        if (token == null) return false;
        return await _auth.VerifyTokenAsync(token) != null;
    }
}

public class RoomRequest
{
    public string? RoomId { get; set; }
    public string? RoomPassword { get; set; }
}

public class TournamentStatusRequest
{
    public string Status { get; set; } = "upcoming";
}
