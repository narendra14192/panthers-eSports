using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Models;
using PanthersEsports.Api.Services;

namespace PanthersEsports.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly PanthersDbContext _db;
    private readonly FirebaseAuthService _auth;
    private static readonly SemaphoreSlim _bookingLock = new(1, 1);

    public SlotsController(PanthersDbContext db, FirebaseAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    // GET /api/slots?tournamentId={id}
    [HttpGet]
    public async Task<IActionResult> GetSlots([FromQuery] string? tournamentId)
    {
        var query = _db.Slots.AsQueryable();
        if (!string.IsNullOrEmpty(tournamentId))
            query = query.Where(s => s.TournamentId == tournamentId);

        var slots = await query.OrderBy(s => s.SlotNumber).ToListAsync();
        return Ok(slots.Select(MapToDto));
    }

    // POST /api/slots/book  (authenticated player)
    [HttpPost("book")]
    public async Task<IActionResult> BookSlot([FromBody] BookSlotRequest req)
    {
        var token = FirebaseAuthService.ExtractBearerToken(Request);
        if (token == null) return Unauthorized(new { error = "Authentication required to book a slot." });

        var decoded = await _auth.VerifyTokenAsync(token);
        if (decoded == null) return Unauthorized(new { error = "Invalid authentication token." });

        // Use a semaphore to prevent race conditions on slot booking
        await _bookingLock.WaitAsync();
        try
        {
            // Check slot exists and is open
            var slot = await _db.Slots
                .FirstOrDefaultAsync(s => s.TournamentId == req.TournamentId && s.SlotNumber == req.SlotNumber);

            if (slot == null) return BadRequest(new { error = "Slot does not exist." });
            if (slot.Status != "open") return Conflict(new { error = $"Slot #{req.SlotNumber} is already taken!" });

            // Check if team already has a slot in this tournament
            if (!string.IsNullOrEmpty(req.TeamId))
            {
                var existingBooking = await _db.Slots
                    .FirstOrDefaultAsync(s => s.TournamentId == req.TournamentId && s.TeamId == req.TeamId);
                if (existingBooking != null)
                    return Conflict(new { error = $"Your team is already in Slot #{existingBooking.SlotNumber}!" });
            }

            // Create or update team record
            var teamId = req.TeamId ?? $"team-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
            var team = await _db.Teams.FindAsync(teamId);
            if (team == null)
            {
                team = new Team
                {
                    Id = teamId,
                    Name = req.TeamName,
                    Tag = req.TeamTag ?? req.TeamName[..Math.Min(4, req.TeamName.Length)].ToUpper(),
                    CaptainUserId = decoded.Uid,
                    CaptainName = req.CaptainName,
                    CaptainPhone = req.CaptainPhone,
                    CaptainUid = req.CaptainUid,
                    PlayersJson = req.PlayersJson ?? "[]",
                    PaymentJson = req.PaymentJson,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                _db.Teams.Add(team);
            }

            // Update slot
            slot.TeamId = teamId;
            slot.Status = "booked";
            slot.BookedAt = DateTime.UtcNow;
            slot.UpdatedAt = DateTime.UtcNow;

            // Save registration record
            var reg = new Registration
            {
                Id = $"reg-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{teamId[..6]}",
                TournamentId = req.TournamentId,
                TournamentName = req.TournamentName ?? "",
                SlotNumber = req.SlotNumber,
                TeamId = teamId,
                TeamName = req.TeamName,
                TeamTag = req.TeamTag ?? "",
                CaptainUserId = decoded.Uid,
                CaptainName = req.CaptainName,
                CaptainPhone = req.CaptainPhone,
                CaptainUid = req.CaptainUid,
                PlayersJson = req.PlayersJson ?? "[]",
                Utr = req.Utr?.Trim(),
                PaymentAmount = req.PaymentAmount > 0 ? req.PaymentAmount : 50,
                PaymentStatus = "pending_verification",
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.Registrations.Add(reg);

            await _db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                slot_number = req.SlotNumber,
                team_id = teamId,
                registration_id = reg.Id,
                message = $"Slot #{req.SlotNumber} successfully secured!",
            });
        }
        finally
        {
            _bookingLock.Release();
        }
    }

    // PUT /api/slots/{id}/status  (admin)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] SlotStatusRequest req)
    {
        if (!await IsAuthAsync()) return Unauthorized();

        var slot = await _db.Slots.FindAsync(id);
        if (slot == null) return NotFound();

        slot.Status = req.Status;
        if (req.Status == "open") { slot.TeamId = null; slot.BookedAt = null; }
        slot.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(slot));
    }

    private async Task<bool> IsAuthAsync()
    {
        var token = FirebaseAuthService.ExtractBearerToken(Request);
        if (token == null) return false;
        return await _auth.VerifyTokenAsync(token) != null;
    }

    private static object MapToDto(Slot s) => new
    {
        id = s.Id,
        tournament_id = s.TournamentId,
        slot_number = s.SlotNumber,
        team_id = s.TeamId,
        status = s.Status,
        payment_status = s.PaymentStatus,
        booked_at = s.BookedAt,
        updated_at = s.UpdatedAt,
    };
}

public class BookSlotRequest
{
    public string TournamentId { get; set; } = string.Empty;
    public string? TournamentName { get; set; }
    public int SlotNumber { get; set; }
    public string? TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string? TeamTag { get; set; }
    public string CaptainName { get; set; } = string.Empty;
    public string? CaptainPhone { get; set; }
    public string? CaptainUid { get; set; }
    public string? PlayersJson { get; set; }
    public string? PaymentJson { get; set; }
    public string? Utr { get; set; }
    public decimal PaymentAmount { get; set; } = 50;
}

public class SlotStatusRequest
{
    public string Status { get; set; } = "open";
    public string? TeamId { get; set; }
}
