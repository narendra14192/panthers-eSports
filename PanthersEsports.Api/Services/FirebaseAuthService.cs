using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace PanthersEsports.Api.Services;

/// <summary>
/// Validates Firebase ID tokens sent from the React frontend.
/// The frontend gets the token via: await firebase.auth().currentUser.getIdToken()
/// </summary>
public class FirebaseAuthService
{
    private readonly ILogger<FirebaseAuthService> _logger;
    private static bool _initialized = false;
    private static readonly object _lock = new();

    public FirebaseAuthService(ILogger<FirebaseAuthService> logger, IConfiguration config)
    {
        _logger = logger;

        lock (_lock)
        {
            if (!_initialized)
            {
                try
                {
                    // Try service account JSON from env first (production Render)
                    var serviceAccountJson = config["FIREBASE_SERVICE_ACCOUNT_JSON"];
                    if (!string.IsNullOrEmpty(serviceAccountJson))
                    {
                        FirebaseApp.Create(new AppOptions
                        {
                            Credential = GoogleCredential.FromJson(serviceAccountJson),
                            ProjectId = config["FIREBASE_PROJECT_ID"] ?? "panthers-esports-8d613"
                        });
                    }
                    else
                    {
                        // Fall back to Application Default Credentials (local dev with gcloud CLI)
                        FirebaseApp.Create(new AppOptions
                        {
                            Credential = GoogleCredential.GetApplicationDefault(),
                            ProjectId = config["FIREBASE_PROJECT_ID"] ?? "panthers-esports-8d613"
                        });
                    }
                    _initialized = true;
                    _logger.LogInformation("✅ Firebase Admin SDK initialized.");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("⚠️ Firebase Admin SDK init failed (auth validation disabled): {Msg}", ex.Message);
                }
            }
        }
    }

    /// <summary>
    /// Verifies a Firebase ID token and returns the decoded token claims.
    /// Returns null if the token is invalid.
    /// </summary>
    public async Task<FirebaseToken?> VerifyTokenAsync(string idToken)
    {
        if (!_initialized) return null;

        try
        {
            return await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Token verification failed: {Msg}", ex.Message);
            return null;
        }
    }

    /// <summary>
    /// Extracts the Bearer token from Authorization header.
    /// </summary>
    public static string? ExtractBearerToken(HttpRequest request)
    {
        var auth = request.Headers.Authorization.FirstOrDefault();
        if (auth != null && auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return auth[7..].Trim();
        return null;
    }
}
