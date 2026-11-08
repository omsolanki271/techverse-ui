import React, { useState, useEffect } from 'react';
import mediaService from '../../services/mediaService';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

const AuthMediaImage = ({ 
  mediaId, 
  alt = 'Media image', 
  className = '', 
  fallback = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400' 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let blobUrl = null;

    if (!mediaId) {
      setLoading(false);
      setImageSrc(fallback);
      return;
    }

    const loadImage = async () => {
      setLoading(true);
      setError(false);
      try {
        blobUrl = await mediaService.fetchMediaBlobUrl(mediaId);
        if (active) {
          setImageSrc(blobUrl);
        }
      } catch (err) {
        if (active) {
          setError(true);
          setImageSrc(fallback);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      active = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [mediaId, fallback]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-techverse-eggshell/40 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-techverse-olive" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc || fallback}
      alt={alt}
      className={className}
      onError={(e) => {
        if (e.target.src !== fallback) {
          e.target.src = fallback;
        }
      }}
    />
  );
};

export default AuthMediaImage;

