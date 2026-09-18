using Microsoft.EntityFrameworkCore;
using PanthersEsports.Api.Data;
using PanthersEsports.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Render Dynamic Port Binding ──────────────────────────────────────────────
var renderPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(renderPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");
}

// ── Database ─────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "Host=localhost;Database=panthers_esports;Username=postgres;Password=postgres";

// Render uses postgres:// URI format — convert to Npgsql format
if (connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
    connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
{
    var uri = new Uri(connectionString);
    var userInfoParts = uri.UserInfo.Split(':', 2);
    var username = Uri.UnescapeDataString(userInfoParts[0]);
    var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : "";
    var dbPort = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');

    connectionString = $"Host={uri.Host};Port={dbPort};Database={database};Username={username};Password={password};SSL Mode=Prefer;Trust Server Certificate=true";
}

builder.Services.AddDbContext<PanthersDbContext>(options =>
    options.UseNpgsql(connectionString));

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<FirebaseAuthService>();
builder.Services.AddScoped<SeedDataService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Panthers Esports API", Version = "v1" });
});

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]
    ?? Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?? "https://panthers-esports-one.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:5173,https://localhost:5173";

var originsList = allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("PanthersPolicy", policy =>
    {
        policy
            .WithOrigins(originsList)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
    // Also allow all for dev convenience
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// ── Ensure Database & Seed on Startup ────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PanthersDbContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        db.Database.EnsureCreated();
        log.LogInformation("Database schema verified/created successfully.");

        var seeder = scope.ServiceProvider.GetRequiredService<SeedDataService>();
        await seeder.SeedAsync();
        log.LogInformation("Database seed verification completed.");
    }
    catch (Exception ex)
    {
        log.LogError(ex, "Database migration/seed encountered an issue. Continuing application startup.");
    }
}

// ── Middleware Pipeline ────────────────────────────────────────────────────────
// Enable Swagger in all environments so live API docs are accessible on Render (/swagger)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Panthers Esports API v1");
    c.RoutePrefix = "swagger";
});

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("PanthersPolicy");
}

app.MapControllers();

// Health check endpoint for Render (returns 200 OK)
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "Panthers Esports API", timestamp = DateTime.UtcNow }));
app.MapGet("/", () => Results.Ok(new { name = "Panthers Esports API", version = "1.0", docs = "/swagger", health = "/health" }));

app.Run();

