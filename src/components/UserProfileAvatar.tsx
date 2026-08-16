import React from 'react';
import { cn } from '../lib/utils';
import { AVATAR_LIST, Render3DAvatar } from './AvatarSelectorModal';

interface UserProfileAvatarProps {
  avatarId?: string;
  customPhotoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  className?: string;
}

export function UserProfileAvatar({
  avatarId = 'cat_glasses',
  customPhotoUrl,
  size = 'md',
  className
}: UserProfileAvatarProps) {
  const sizeClasses: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  const selectedSizeClass = sizeClasses[size] || (size.includes('w-') ? size : 'w-10 h-10');

  // If user uploaded a custom photo from gallery or camera
  if (customPhotoUrl) {
    return (
      <div className={cn("rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100 shadow-2xs", selectedSizeClass, className)}>
        <img
          src={customPhotoUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Find matching avatar in AVATAR_LIST
  const found = AVATAR_LIST.find(a => a.id === avatarId);
  const svgType = found ? found.svgType : (avatarId === 'cat_glasses' || avatarId === 'avatar_cat' ? 'cat_classic' : 'cat_classic');
  const bgColor = found ? found.bgColor : '#93C5FD';

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 border border-gray-100/80 shadow-2xs", selectedSizeClass, className)}>
      <div className="w-full h-full">
        <Render3DAvatar type={svgType} bgColor={bgColor} />
      </div>
    </div>
  );
}
