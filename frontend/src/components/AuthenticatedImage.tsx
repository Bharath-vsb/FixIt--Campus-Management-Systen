import { useState, useEffect } from 'react';
import api from '../services/api';

interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  url: string;
}

export default function AuthenticatedImage({ url, className, alt, ...props }: AuthenticatedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const fetchImage = async () => {
      try {
        // Remove leading /api since the Axios instance baseURL already contains it
        const fetchUrl = url.startsWith('/api') ? url.substring(4) : url;
        // Fetch as blob so Axios attaches the JWT Authorization header
        const response = await api.get(fetchUrl, { responseType: 'blob' });
        if (isMounted) {
          objectUrl = URL.createObjectURL(response.data);
          setImgSrc(objectUrl);
        }
      } catch (err) {
        if (isMounted) setError(true);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className={`bg-surface-container-high flex items-center justify-center text-on-surface-variant ${className}`}>
        <span className="material-symbols-outlined text-[32px]">broken_image</span>
      </div>
    );
  }

  if (!imgSrc) {
    return (
      <div className={`bg-surface-container-high animate-pulse flex items-center justify-center ${className}`}>
        <span className="material-symbols-outlined text-outline/30 text-[32px]">photo</span>
      </div>
    );
  }

  return <img src={imgSrc} alt={alt} className={className} {...props} />;
}
