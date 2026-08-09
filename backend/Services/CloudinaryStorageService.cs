using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using System.Net;

namespace backend.Services;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(IConfiguration configuration)
    {
        var cloudinaryUrl = Environment.GetEnvironmentVariable("CLOUDINARY_URL") ?? configuration["CLOUDINARY_URL"];
        if (string.IsNullOrEmpty(cloudinaryUrl))
        {
            throw new Exception("CLOUDINARY_URL is missing.");
        }
        _cloudinary = new Cloudinary(cloudinaryUrl);
        _cloudinary.Api.Secure = true;
    }

    public async Task<(string storageReference, string fileName)> SaveUploadedFileAsync(IFormFile file)
    {
        await using var stream = file.OpenReadStream();
        
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Type = "authenticated" // protect original and derived images
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        
        if (uploadResult.Error != null)
        {
            throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
        }

        // storageReference is the Cloudinary PublicId
        return (uploadResult.PublicId, file.FileName);
    }

    public async Task<(Stream fileStream, string contentType)> GetFileStreamAsync(string storageReference)
    {
        // 1. Generate an authenticated URL (time-limited signature)
        var url = _cloudinary.Api.UrlImgUp
            .ResourceType("image")
            .Action("upload")
            .Type("authenticated")
            .Signed(true) // generates signature based on API secret
            .BuildUrl(storageReference);
            
        // 2. Fetch the bytes from Cloudinary using HttpClient
        using var httpClient = new HttpClient();
        var response = await httpClient.GetAsync(url);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new FileNotFoundException($"Could not fetch file from Cloudinary (Status: {response.StatusCode})");
        }

        // 3. Return the stream
        var stream = await response.Content.ReadAsStreamAsync();
        var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
        
        // Return a memory stream so the HttpClient can be disposed safely here, or leave it open
        // A better approach is to copy it to a MemoryStream.
        var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        ms.Position = 0;
        
        return (ms, contentType);
    }
}
