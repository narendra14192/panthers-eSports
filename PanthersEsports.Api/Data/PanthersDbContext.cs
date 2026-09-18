using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Models;

namespace PanthersEsports.Api.Data;

public class PanthersDbContext : DbContext
{
    public PanthersDbContext(DbContextOptions<PanthersDbContext> options) : base(options) { }

    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<Slot> Slots => Set<Slot>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<LeaderboardEntry> Leaderboard => Set<LeaderboardEntry>();
    public DbSet<Match> Matches => Set<Match>();
    public DbSet<Registration> Registrations => Set<Registration>();
    public DbSet<AdminLog> AdminLogs => Set<AdminLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Tournament ───────────────────────────────────────────────────────
        modelBuilder.Entity<Tournament>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.EntryFee).HasColumnType("decimal(10,2)");
            e.Property(t => t.PrizePool).HasColumnType("decimal(10,2)");
            e.HasMany(t => t.Slots).WithOne(s => s.Tournament).HasForeignKey(s => s.TournamentId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.Matches).WithOne(m => m.Tournament).HasForeignKey(m => m.TournamentId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.Registrations).WithOne(r => r.Tournament).HasForeignKey(r => r.TournamentId).OnDelete(DeleteBehavior.Cascade);
        });

        // ── Team ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Team>(e =>
        {
            e.HasKey(t => t.Id);
            e.HasMany(t => t.Slots).WithOne(s => s.Team).HasForeignKey(s => s.TeamId).OnDelete(DeleteBehavior.SetNull);
            e.HasMany(t => t.Registrations).WithOne(r => r.Team).HasForeignKey(r => r.TeamId).OnDelete(DeleteBehavior.SetNull);
        });

        // ── Slot ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Slot>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => new { s.TournamentId, s.SlotNumber }).IsUnique();
            // TeamId is nullable FK
            e.HasOne(s => s.Team).WithMany(t => t.Slots).HasForeignKey(s => s.TeamId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        });

        // ── LeaderboardEntry ─────────────────────────────────────────────────
        modelBuilder.Entity<LeaderboardEntry>(e =>
        {
            e.HasKey(lb => lb.Id);
            e.HasOne(lb => lb.Tournament).WithMany(t => t.LeaderboardEntries).HasForeignKey(lb => lb.TournamentId).IsRequired(false).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(lb => lb.Team).WithMany(t => t.LeaderboardEntries).HasForeignKey(lb => lb.TeamId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        });

        // ── Registration ─────────────────────────────────────────────────────
        modelBuilder.Entity<Registration>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.PaymentAmount).HasColumnType("decimal(10,2)");
            e.HasOne(r => r.Team).WithMany(t => t.Registrations).HasForeignKey(r => r.TeamId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);
        });

        // ── AdminLog ─────────────────────────────────────────────────────────
        modelBuilder.Entity<AdminLog>(e =>
        {
            e.HasKey(l => l.Id);
        });
    }
}
