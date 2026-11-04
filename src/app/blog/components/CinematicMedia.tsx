'use client';

import { useState } from 'react';
import { Film } from 'lucide-react';

interface CinematicMediaProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectClassName?: string;
  imgClassName?: string;
  caption?: string;
  overlayScrim?: boolean;
}

export default function CinematicMedia({
  src,
  alt,
  width = 1600,
  height = 900,
  priority = false,
  aspectClassName = 'aspect-[16/9]',
  imgClassName = '',
  caption,
  overlayScrim = false,
}: CinematicMediaProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className="m-0">
      <div
        className={`relative overflow-hidden bg-[#14100E] border-2 border-[#14100E] rounded-xl shadow-[3px_3px_0_#14100E] ${aspectClassName}`}
      >
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-transform duration-200 ease-out ${imgClassName}`}
          />
        ) : (
          <div
            role="img"
            aria-label={alt || 'Cinematic visual plate'}
            className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#14100E]"
          >
            <Film className="w-8 h-8 text-[#012CEB] mb-3" aria-hidden="true" />
            <span className="text-xs font-mono-tech text-[#F4EFE6]/80 max-w-md">
              {alt || 'Cinematic Frame Study'}
            </span>
          </div>
        )}

        {overlayScrim && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14100E]/80 via-transparent to-transparent"
          />
        )}
      </div>

      {caption && (
        <figcaption className="mt-2.5 text-xs text-[#6B625A] leading-relaxed font-sans">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
