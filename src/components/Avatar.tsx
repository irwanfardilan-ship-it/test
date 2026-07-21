import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  className?: string;
}

export function Avatar({ src, name, className = "h-8 w-8" }: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Render image if src is valid, does not fail, and is not a placeholder Unsplash link
  if (src && !hasError && !src.includes('images.unsplash.com')) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onError={() => setHasError(true)}
        className={`${className} rounded-full object-cover border border-slate-200 dark:border-white/10`}
      />
    );
  }

  // Elegant fallback gradient avatar with initials
  return (
    <div className={`${className} rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-bold select-none border border-slate-200 dark:border-white/10 shadow-sm uppercase shrink-0 text-center`}>
      <span className="text-[10px] tracking-wider">{initials}</span>
    </div>
  );
}
