using Microsoft.AspNetCore.Http;

namespace backend.Services;

public interface IFileStorageService
{
    Task<(string storageReference, string fileName)> SaveUploadedFileAsync(IFormFile file);
    Task<(Stream fileStream, string contentType)> GetFileStreamAsync(string storageReference);
}
