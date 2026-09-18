using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Models;
using PanthersEsports.Api.Services;

namespace PanthersEsports.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrationsController : ControllerBase
{
    private readonly PanthersDbContext _db;
    private readonly FirebaseAuthService _auth;

    public RegistrationsController(PanthersDbContext db, FirebaseAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/registrations?tournamentId={id}&status={status}  (admin)
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? tournamentId, [FromQuery] string? status)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var query = _db.Registrations.AsQueryable();
        if (!string.IsNullOrEmpty(tournamentId)) query = query.Where(r => r.TournamentId == tournamentId);
        if (!string.IsNullOrEmpty(status)) query = query.Where(r => r.Status == status);

        var regs = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(regs.Select(MapToDto));
    }

    // PUT /api/registrations/{id}/approve  (admin)
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(string id)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var reg = await _db.Registrations.FindAsync(id);
        if (reg == null) return NotFound();

        reg.Status = "accepted";
        reg.PaymentStatus = "verified";
        reg.ReviewedAt = DateTime.UtcNow;
        reg.AdminNotes = "Verified by Admin";
        reg.UpdatedAt = DateTime.UtcNow;

        // Mark slot as booked+verified
        var slot = await _db.Slots.FirstOrDefaultAsync(s => s.TournamentId == reg.TournamentId && s.SlotNumber == reg.SlotNumber);
        if (slot != null)
        {
            slot.TeamId = reg.TeamId;
            slot.Status = "booked";
            slot.PaymentStatus = "verified";
            slot.UpdatedAt = DateTime.UtcNow;
        }

        // Update team payment status
        var team = await _db.Teams.FindAsync(reg.TeamId);
        if (team != null)
        {
            var payment = new { utr = reg.Utr, status = "verified", verified_at = DateTime.UtcNow };
            team.PaymentJson = JsonSerializer.Serialize(payment);
            team.UpdatedAt = DateTime.UtcNow;
        }

        _db.AdminLogs.Add(new AdminLog
        {
            Id = $"log-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "REGISTRATION_ACCEPTED",
            Details = $"Accepted [{reg.TeamTag}] {reg.TeamName} for Slot #{reg.SlotNumber}. UTR: {reg.Utr ?? "N/A"} verified.",
            Timestamp = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
        return Ok(MapToDto(reg));
    }

    // PUT /api/registrations/{id}/reject  (admin)
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(string id, [FromBody] RejectRequest? req)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var reg = await _db.Registrations.FindAsync(id);
        if (reg == null) return NotFound();

        reg.Status = "rejected";
        reg.PaymentStatus = "rejected";
        reg.AdminNotes = req?.Reason ?? "UTR verification failed";
        reg.ReviewedAt = DateTime.UtcNow;
        reg.UpdatedAt = DateTime.UtcNow;

        // Free the slot
        var slot = await _db.Slots.FirstOrDefaultAsync(s => s.TournamentId == reg.TournamentId && s.SlotNumber == reg.SlotNumber);
        if (slot != null)
        {
            slot.TeamId = null;
            slot.Status = "open";
            slot.BookedAt = null;
            slot.PaymentStatus = null;
            slot.UpdatedAt = DateTime.UtcNow;
        }

        _db.AdminLogs.Add(new AdminLog
        {
            Id = $"log-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Action = "REGISTRATION_REJECTED",
            Details = $"Rejected [{reg.TeamTag}] {reg.TeamName} (Slot #{reg.SlotNumber}). Reason: {reg.AdminNotes}. Slot freed.",
            Timestamp = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
        return Ok(MapToDto(reg));
    }

    private async Task<bool> IsAuthAsync()
    {
        var token = FirebaseAuthService.ExtractBearerToken(Request);
        if (token == null) return false;
        return await _auth.VerifyTokenAsync(token) != null;
    }

    private static object MapToDto(Registration r) => new
    {
        id = r.Id,
        tournament_id = r.TournamentId,
        tournament_name = r.TournamentName,
        slot_number = r.SlotNumber,
        team_id = r.TeamId,
        team_name = r.TeamName,
        team_tag = r.TeamTag,
        captain_name = r.CaptainName,
        captain_phone = r.CaptainPhone,
        captain_uid = r.CaptainUid,
        payment = new { utr = r.Utr, amount = r.PaymentAmount, method = r.PaymentMethod, status = r.PaymentStatus, submitted_at = r.CreatedAt },
        status = r.Status,
        admin_notes = r.AdminNotes,
        reviewed_by = r.ReviewedBy,
        reviewed_at = r.ReviewedAt,
        created_at = r.CreatedAt,
        updated_at = r.UpdatedAt,
    };
}

public class RejectRequest
{
    public string? Reason { get; set; }
}
