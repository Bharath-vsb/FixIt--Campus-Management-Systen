using System.Text;
using System.Text.Json.Serialization;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Render Port Binding
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString) && 
    (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var database = Uri.UnescapeDataString(uri.LocalPath.TrimStart('/'));

    connectionString = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={database};Username={username};Password={password};Ssl Mode=Require;Trust Server Certificate=true;";
}

builder.Services.AddDbContext<FixItDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add CORS
var allowedOrigins = builder.Configuration["CORS_ORIGINS"]?.Split(',') ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecific",
        b =>
        {
            if (builder.Environment.IsDevelopment())
            {
                b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            }
            else
            {
                b.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader();
            }
        });
});

// Configure Storage Service
var storageProvider = Environment.GetEnvironmentVariable("STORAGE_PROVIDER") ?? builder.Configuration["STORAGE_PROVIDER"];
if (storageProvider == "Cloudinary")
{
    builder.Services.AddScoped<backend.Services.IFileStorageService, backend.Services.CloudinaryStorageService>();
}
else
{
    builder.Services.AddScoped<backend.Services.IFileStorageService, backend.Services.LocalFileStorageService>();
}

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("JWT Key is not configured in appsettings.json");

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Increase max request body size for image uploads (20 MB)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 20_000_000;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// ── Ensure uploads directory exists ──────────────────────────────────────────
var uploadsRoot = app.Configuration["UploadSettings:UploadsRoot"]
    ?? Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsRoot);

// ── Apply schema additions (idempotent SQL) ───────────────────────────────────
var shouldMigrate = args.Contains("--migrate");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<FixItDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    // Automatically apply migrations in Production or if --migrate is passed
    if (shouldMigrate || app.Environment.IsProduction())
    {
        try
        {
            logger.LogInformation("Running EF Core migrations...");
            db.Database.Migrate();
            logger.LogInformation("Migrations completed successfully.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Migrate() failed — attempting direct SQL schema fix.");
        }
    }

    // Idempotent DDL — safe to run even if columns already exist
    try
    {
        db.Database.ExecuteSqlRaw(@"
            ALTER TABLE ""Issues"" ADD COLUMN IF NOT EXISTS ""VerifiedByUserId"" integer;
            ALTER TABLE ""Issues"" ADD COLUMN IF NOT EXISTS ""VerifiedAt"" timestamp with time zone;
            ALTER TABLE ""Issues"" ADD COLUMN IF NOT EXISTS ""ReworkNotes"" text;

            CREATE TABLE IF NOT EXISTS ""IssueEvidences"" (
                ""Id"" serial PRIMARY KEY,
                ""IssueId"" integer NOT NULL,
                ""UploadedByUserId"" integer NOT NULL,
                ""ImageType"" text NOT NULL,
                ""FileName"" text NOT NULL,
                ""ContentType"" text NOT NULL,
                ""FileSize"" bigint NOT NULL,
                ""StoragePath"" text NOT NULL,
                ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT now()
            );

            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_Issues_Users_VerifiedByUserId'
                ) THEN
                    ALTER TABLE ""Issues""
                        ADD CONSTRAINT ""FK_Issues_Users_VerifiedByUserId""
                        FOREIGN KEY (""VerifiedByUserId"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL;
                END IF;
            END $$;

            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_IssueEvidences_Issues_IssueId'
                ) THEN
                    ALTER TABLE ""IssueEvidences""
                        ADD CONSTRAINT ""FK_IssueEvidences_Issues_IssueId""
                        FOREIGN KEY (""IssueId"") REFERENCES ""Issues""(""Id"") ON DELETE CASCADE;
                END IF;
            END $$;

            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_IssueEvidences_Users_UploadedByUserId'
                ) THEN
                    ALTER TABLE ""IssueEvidences""
                        ADD CONSTRAINT ""FK_IssueEvidences_Users_UploadedByUserId""
                        FOREIGN KEY (""UploadedByUserId"") REFERENCES ""Users""(""Id"") ON DELETE RESTRICT;
                END IF;
            END $$;

            CREATE INDEX IF NOT EXISTS ""IX_IssueEvidences_IssueId"" ON ""IssueEvidences""(""IssueId"");
            CREATE INDEX IF NOT EXISTS ""IX_IssueEvidences_UploadedByUserId"" ON ""IssueEvidences""(""UploadedByUserId"");
            CREATE INDEX IF NOT EXISTS ""IX_Issues_VerifiedByUserId"" ON ""Issues""(""VerifiedByUserId"");
        ");
        logger.LogInformation("Schema additions applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Schema additions failed.");
    }
}

// ── Seed Database ─────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try { SeedData.Initialize(services); }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

// NOTE: Do NOT serve /uploads as static files — all image access goes through authenticated API endpoints

app.UseCors("AllowSpecific");

app.MapGet("/health", () => new { status = "healthy" });

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

if (shouldMigrate)
{
    // If we only wanted to migrate, exit now
    return;
}

app.Run();
