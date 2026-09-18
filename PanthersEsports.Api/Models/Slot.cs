namespace PanthersEsports.Api.Models;

public class Slot
{
    public string Id { get; set; } = string.Empty;
    public string TournamentId { get; set; } = string.Empty;
    public int SlotNumber { get; set; }
    public string? TeamId { get; set; }
    public string Status { get; set; } = "open"; // open | booked | checked_in
    public string? PaymentStatus { get; set; }   // null | pending_verification | verified | rejected
    public DateTime? BookedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Tournament? Tournament { get; set; }
    public Team? Team { get; set; }
}
