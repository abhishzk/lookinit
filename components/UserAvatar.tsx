'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

interface UserAvatarProps {
  user: User;
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 40, className = "" }: UserAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (user?.photoURL) {
      // Reset states when user changes
      setImageLoaded(false);
      setImageError(false);
      
      // Try to preload the image
      const img = new Image();
      img.onload = () => {
        setImageSrc(user.photoURL);
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        console.error('Failed to load profile image:', user.photoURL);
        setImageError(true);
        setImageLoaded(false);
      };
      img.src = user.photoURL;
    } else {
      setImageError(true);
    }
  }, [user?.photoURL]);

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getBackgroundColor = () => {
    // Generate a consistent color based on user email
    if (user?.email) {
      const hash = user.email.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
        'bg-pink-500', 'bg-indigo-500', 'bg-red-500',
        'bg-yellow-500', 'bg-teal-500'
      ];
      return colors[Math.abs(hash) % colors.length];
    }
    return 'bg-gray-500';
  };

  return (
    <div 
      className={`rounded-full overflow-hidden border border-gray-300 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {imageLoaded && imageSrc && !imageError ? (
        <img
          src={imageSrc}
          alt={user?.displayName || "User Avatar"}
          className="w-full h-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center text-white font-semibold ${getBackgroundColor()}`}
          style={{ 
            fontSize: size * 0.4,
            width: size, 
            height: size 
          }}
        >
          {getInitials()}
        </div>
      )}
    </div>
  );
}
