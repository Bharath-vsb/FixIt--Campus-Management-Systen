using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;

namespace backend.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadsRoot;
    private readonly FileExtensionContentTypeProvider _provider;

    public LocalFileStorageService(IConfiguration configuration, IHostEnvironment env)
    {
        _uploadsRoot = configuration["UploadSettings:UploadsRoot"]
            ?? Path.Combine(env.ContentRootPath, "uploads");
        
        Directory.CreateDirectory(_uploadsRoot);
        _provider = new FileExtensionContentTypeProvider();
    }

    public async Task<(string storageReference, string fileName)> SaveUploadedFileAsync(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{ext}";
        
        var relativePath = Path.Combine("uploads", fileName).Replace('\\', '/');
        var absolutePath = Path.Combine(_uploadsRoot, fileName);

        await using var stream = new FileStream(absolutePath, FileMode.Create, FileAccess.Write);
        await file.CopyToAsync(stream);

        return (relativePath, fileName);
    }

    public Task<(Stream fileStream, string contentType)> GetFileStreamAsync(string storageReference)
    {
        // For LocalFileStorageService, storageReference is something like "uploads/xyz.jpg"
        var fileName = Path.GetFileName(storageReference);
        var absolutePath = Path.Combine(_uploadsRoot, fileName);

        if (!File.Exists(absolutePath))
            throw new FileNotFoundException($"File not found: {fileName}");

        if (!_provider.TryGetContentType(fileName, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        var stream = new FileStream(absolutePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        
        return Task.FromResult<(Stream, string)>((stream, contentType));
    }
}
