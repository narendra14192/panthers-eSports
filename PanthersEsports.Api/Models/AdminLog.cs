namespace PanthersEsports.Api.Models;

public class AdminLog
{
    public string Id { get; set; } = string.Empty;
    public string AdminName { get; set; } = "PantherAdmin";
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
