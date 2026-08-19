import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, X, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export type AvatarOption = {
  id: string;
  name: string;
  bgColor: string;
  svgType: string;
};

export const AVATAR_LIST: AvatarOption[] = [
  { id: 'avatar_1', name: 'Bearded Executive', bgColor: '#1E293B', svgType: 'bearded_man' },
  { id: 'avatar_2', name: 'Intellectual with Glasses', bgColor: '#1E3A8A', svgType: 'glasses_suit' },
  { id: 'avatar_3', name: 'Mustache Gentleman', bgColor: '#EA580C', svgType: 'mustache_orange' },
  { id: 'avatar_4', name: 'Afro Guy', bgColor: '#84CC16', svgType: 'curly_lime' },
  { id: 'avatar_5', name: 'Bald Beard', bgColor: '#78716C', svgType: 'bald_beard' },
  { id: 'avatar_6', name: 'Green Beanie Guy', bgColor: '#3F6212', svgType: 'green_beanie' },
  { id: 'avatar_7', name: 'Red Cap Guy', bgColor: '#DC2626', svgType: 'red_cap' },
  { id: 'avatar_8', name: 'Pink Beard Guy', bgColor: '#A855F7', svgType: 'purple_hair' },
  { id: 'avatar_9', name: 'Red Beanie Explorer', bgColor: '#0D9488', svgType: 'red_beanie' },
  { id: 'avatar_10', name: 'Side Part Gentleman', bgColor: '#CA8A04', svgType: 'side_part' },
  { id: 'avatar_11', name: 'Casual Boy', bgColor: '#6366F1', svgType: 'casual_blue' },
  { id: 'avatar_12', name: 'Turban Guy', bgColor: '#2563EB', svgType: 'turban_blue' },
  // Extra avatars revealed on "Lihat Semua Avatar"
  { id: 'avatar_cat', name: 'BrusaSCS Cat Classic', bgColor: '#93C5FD', svgType: 'cat_classic' },
  { id: 'avatar_13', name: 'Modern Woman', bgColor: '#EC4899', svgType: 'modern_woman' },
  { id: 'avatar_14', name: 'Crypto Bull', bgColor: '#059669', svgType: 'crypto_bull' },
  { id: 'avatar_15', name: 'Glasses Chic', bgColor: '#8B5CF6', svgType: 'glasses_chic' }
];

export function Render3DAvatar({ type, bgColor = '#1E293B' }: { type: string; bgColor?: string }) {
  if (type === 'cat_classic') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill={bgColor}/>
        <polygon points="25,35 15,10 40,25" fill="#3B82F6"/>
        <polygon points="75,35 85,10 60,25" fill="#3B82F6"/>
        <circle cx="50" cy="55" r="32" fill="#E0F2FE"/>
        <rect x="33" y="45" width="15" height="12" rx="3" fill="none" stroke="#1E3A8A" strokeWidth="2.5"/>
        <rect x="52" y="45" width="15" height="12" rx="3" fill="none" stroke="#1E3A8A" strokeWidth="2.5"/>
        <line x1="48" y1="51" x2="52" y2="51" stroke="#1E3A8A" strokeWidth="2.5"/>
        <circle cx="40" cy="51" r="2.5" fill="#1E3A8A"/>
        <circle cx="60" cy="51" r="2.5" fill="#1E3A8A"/>
        <polygon points="50,57 47,54 53,54" fill="#3B82F6"/>
        <path d="M 47,60 Q 50,63 53,60" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 30,78 Q 50,88 70,78 L 75,90 Q 50,95 25,90 Z" fill="#2563EB"/>
      </svg>
    );
  }

  // 3D Avatar styles with smooth clay shading gradients
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <radialGradient id={`grad_bg_${type}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id={`skin_${type}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5B895" />
          <stop offset="70%" stopColor="#C97A52" />
          <stop offset="100%" stopColor="#8C4A28" />
        </radialGradient>
        <radialGradient id={`skin_dark_${type}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#A86544" />
          <stop offset="80%" stopColor="#6E3A1E" />
          <stop offset="100%" stopColor="#4A2511" />
        </radialGradient>
        <radialGradient id={`hair_dark_${type}`} cx="40%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#3A3A3C" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </radialGradient>
        <filter id={`shadow_${type}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="50" fill={bgColor} />
      <circle cx="50" cy="50" r="50" fill={`url(#grad_bg_${type})`} />

      {/* Avatar variations */}
      {type === 'bearded_man' && (
        <g filter={`url(#shadow_${type})`}>
          {/* Shoulders / Shirt */}
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#334155" />
          <path d="M 42 70 L 50 78 L 58 70 Z" fill="#E2E8F0" />
          {/* Neck */}
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          {/* Head */}
          <ellipse cx="50" cy="45" rx="17" ry="19" fill={`url(#skin_${type})`} />
          {/* Ears */}
          <circle cx="32" cy="46" r="4.5" fill={`url(#skin_${type})`} />
          <circle cx="68" cy="46" r="4.5" fill={`url(#skin_${type})`} />
          {/* Hair */}
          <path d="M 33 42 C 32 24, 68 24, 67 42 C 63 26, 37 26, 33 42 Z" fill={`url(#hair_dark_${type})`} />
          {/* Eyes & Eyebrows */}
          <circle cx="43" cy="42" r="2" fill="#1C1C1E" />
          <circle cx="57" cy="42" r="2" fill="#1C1C1E" />
          <path d="M 39 37 Q 44 35 47 37" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 53 37 Q 56 35 61 37" stroke="#1C1C1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* 3D Beard */}
          <path d="M 35 48 C 35 67, 65 67, 65 48 C 65 52, 60 62, 50 62 C 40 62, 35 52, 35 48 Z" fill={`url(#hair_dark_${type})`} />
          {/* Nose */}
          <ellipse cx="50" cy="46" rx="2.5" ry="3" fill="#B2633C" />
          {/* Smile inside beard */}
          <path d="M 46 54 Q 50 58 54 54" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'glasses_suit' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 18 100 C 18 72, 38 68, 50 68 C 62 68, 82 72, 82 100 Z" fill="#1E293B" />
          <polygon points="50,68 44,78 50,96 56,78" fill="#64748B" />
          <polygon points="50,78 47,94 50,98 53,94" fill="#E11D48" />
          <rect x="44" y="56" width="12" height="14" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="43" rx="16" ry="18" fill={`url(#skin_${type})`} />
          <circle cx="33" cy="44" r="4" fill={`url(#skin_${type})`} />
          <circle cx="67" cy="44" r="4" fill={`url(#skin_${type})`} />
          {/* Side parted neat hair */}
          <path d="M 33 39 C 32 20, 68 22, 67 39 C 62 25, 42 24, 33 39 Z" fill="#292524" />
          {/* Glasses */}
          <circle cx="43" cy="41" r="5.5" fill="none" stroke="#0F172A" strokeWidth="1.8" />
          <circle cx="57" cy="41" r="5.5" fill="none" stroke="#0F172A" strokeWidth="1.8" />
          <line x1="48.5" y1="41" x2="51.5" y2="41" stroke="#0F172A" strokeWidth="1.8" />
          <circle cx="43" cy="41" r="1.8" fill="#0F172A" />
          <circle cx="57" cy="41" r="1.8" fill="#0F172A" />
          <ellipse cx="50" cy="46" rx="2" ry="2.5" fill="#B2633C" />
          <path d="M 46 52 Q 50 55 54 52" stroke="#6E3A1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'mustache_orange' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#FB923C" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="44" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Stylized Red/Orange pompadour Hair */}
          <path d="M 31 38 C 30 18, 55 12, 68 28 C 69 40, 55 24, 31 38 Z" fill="#C2410C" />
          <circle cx="43" cy="41" r="2" fill="#1C1C1E" />
          <circle cx="57" cy="41" r="2" fill="#1C1C1E" />
          <ellipse cx="50" cy="45" rx="2.5" ry="2.5" fill="#B2633C" />
          {/* Mustache */}
          <path d="M 40 50 Q 50 47 60 50 Q 50 54 40 50 Z" fill="#9A3412" />
        </g>
      )}

      {type === 'curly_lime' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#A3E635" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_dark_${type})`} />
          <ellipse cx="50" cy="45" rx="17" ry="19" fill={`url(#skin_dark_${type})`} />
          {/* Curly Afro Hair */}
          <circle cx="36" cy="30" r="7" fill="#1C1917" />
          <circle cx="46" cy="26" r="8" fill="#1C1917" />
          <circle cx="56" cy="26" r="8" fill="#1C1917" />
          <circle cx="64" cy="30" r="7" fill="#1C1917" />
          <circle cx="43" cy="43" r="2" fill="#000" />
          <circle cx="57" cy="43" r="2" fill="#000" />
          <ellipse cx="50" cy="48" rx="3" ry="3" fill="#4A2511" />
          <path d="M 46 54 Q 50 57 54 54" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'bald_beard' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#57534E" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_dark_${type})`} />
          <ellipse cx="50" cy="44" rx="17" ry="19" fill={`url(#skin_dark_${type})`} />
          <circle cx="32" cy="45" r="4.5" fill={`url(#skin_dark_${type})`} />
          <circle cx="68" cy="45" r="4.5" fill={`url(#skin_dark_${type})`} />
          <circle cx="43" cy="41" r="2" fill="#000" />
          <circle cx="57" cy="41" r="2" fill="#000" />
          <path d="M 41 50 C 41 62, 59 62, 59 50 Z" fill="#1C1917" />
          <ellipse cx="50" cy="46" rx="2.5" ry="2.5" fill="#4A2511" />
        </g>
      )}

      {type === 'green_beanie' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#15803D" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="46" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Green Knit Beanie */}
          <ellipse cx="50" cy="33" rx="18" ry="14" fill="#14532D" />
          <rect x="31" y="30" width="38" height="8" rx="3" fill="#166534" />
          <circle cx="43" cy="43" r="2" fill="#000" />
          <circle cx="57" cy="43" r="2" fill="#000" />
          <path d="M 37 49 C 37 65, 63 65, 63 49 Z" fill="#292524" />
          <ellipse cx="50" cy="47" rx="2.5" ry="2.5" fill="#B2633C" />
          <path d="M 46 54 Q 50 57 54 54" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'red_cap' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#EF4444" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="45" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Backwards Red Cap */}
          <ellipse cx="50" cy="32" rx="18" ry="12" fill="#B91C1C" />
          <ellipse cx="50" cy="38" rx="12" ry="5" fill="#991B1B" />
          <circle cx="43" cy="43" r="2" fill="#000" />
          <circle cx="57" cy="43" r="2" fill="#000" />
          <ellipse cx="50" cy="47" rx="2.5" ry="2.5" fill="#B2633C" />
          <path d="M 46 53 Q 50 57 54 53" stroke="#6E3A1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'purple_hair' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#C084FC" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_dark_${type})`} />
          <ellipse cx="50" cy="45" rx="16" ry="18" fill={`url(#skin_dark_${type})`} />
          {/* Textured Curly Hair & Beard */}
          <path d="M 32 38 C 30 18, 70 18, 68 38 C 60 22, 40 22, 32 38 Z" fill="#1C1917" />
          <circle cx="43" cy="42" r="2" fill="#000" />
          <circle cx="57" cy="42" r="2" fill="#000" />
          <path d="M 37 48 C 37 63, 63 63, 63 48 Z" fill="#1C1917" />
          <ellipse cx="50" cy="46" rx="2.5" ry="2.5" fill="#4A2511" />
        </g>
      )}

      {type === 'red_beanie' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#2DD4BF" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="46" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Red Knit Beanie */}
          <ellipse cx="50" cy="33" rx="18" ry="13" fill="#DC2626" />
          <rect x="32" y="30" width="36" height="7" rx="3" fill="#EF4444" />
          <circle cx="43" cy="43" r="2" fill="#000" />
          <circle cx="57" cy="43" r="2" fill="#000" />
          <path d="M 36 49 C 36 64, 64 64, 64 49 Z" fill="#1C1917" />
          <ellipse cx="50" cy="47" rx="2.5" ry="2.5" fill="#B2633C" />
        </g>
      )}

      {type === 'side_part' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#BEF264" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="45" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Sleek Dark Hair */}
          <path d="M 31 38 C 30 18, 69 22, 68 38 C 58 24, 40 24, 31 38 Z" fill="#171717" />
          <circle cx="43" cy="42" r="2" fill="#000" />
          <circle cx="57" cy="42" r="2" fill="#000" />
          <ellipse cx="50" cy="46" rx="2.5" ry="2.5" fill="#B2633C" />
          <path d="M 46 52 Q 50 56 54 52" stroke="#6E3A1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'casual_blue' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#3B82F6" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="45" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Messy Brown Hair */}
          <path d="M 32 38 C 30 16, 70 16, 68 38 C 60 22, 38 22, 32 38 Z" fill="#78350F" />
          <circle cx="43" cy="42" r="2" fill="#000" />
          <circle cx="57" cy="42" r="2" fill="#000" />
          <ellipse cx="50" cy="46" rx="2.5" ry="2.5" fill="#B2633C" />
          <path d="M 46 53 Q 50 57 54 53" stroke="#6E3A1E" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'turban_blue' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#EAB308" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_dark_${type})`} />
          <ellipse cx="50" cy="46" rx="16" ry="18" fill={`url(#skin_dark_${type})`} />
          {/* Royal Blue Turban */}
          <ellipse cx="50" cy="30" rx="19" ry="15" fill="#1D4ED8" />
          <ellipse cx="50" cy="26" rx="10" ry="8" fill="#2563EB" />
          <circle cx="43" cy="44" r="2" fill="#000" />
          <circle cx="57" cy="44" r="2" fill="#000" />
          <path d="M 37 49 C 37 64, 63 64, 63 49 Z" fill="#171717" />
          <ellipse cx="50" cy="48" rx="2.5" ry="2.5" fill="#4A2511" />
        </g>
      )}

      {type === 'modern_woman' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#F472B6" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          {/* Long Hair Back */}
          <ellipse cx="50" cy="50" rx="22" ry="24" fill="#312E81" />
          <ellipse cx="50" cy="45" rx="15" ry="17" fill={`url(#skin_${type})`} />
          {/* Hair Front */}
          <path d="M 33 38 C 35 22, 65 22, 67 38 C 62 26, 38 26, 33 38 Z" fill="#312E81" />
          <circle cx="43" cy="43" r="2" fill="#000" />
          <circle cx="57" cy="43" r="2" fill="#000" />
          <ellipse cx="50" cy="47" rx="2" ry="2" fill="#B2633C" />
          <path d="M 46 53 Q 50 57 54 53" stroke="#BE185D" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      )}

      {type === 'crypto_bull' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#047857" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill="#10B981" />
          <ellipse cx="50" cy="45" rx="18" ry="18" fill="#059669" />
          {/* Bull Horns */}
          <path d="M 32 35 Q 22 20 28 10 Q 35 25 36 32 Z" fill="#F59E0B" />
          <path d="M 68 35 Q 78 20 72 10 Q 65 25 64 32 Z" fill="#F59E0B" />
          <circle cx="43" cy="43" r="2.5" fill="#FFF" />
          <circle cx="43" cy="43" r="1.5" fill="#000" />
          <circle cx="57" cy="43" r="2.5" fill="#FFF" />
          <circle cx="57" cy="43" r="1.5" fill="#000" />
          <ellipse cx="50" cy="52" rx="7" ry="5" fill="#047857" />
          <circle cx="47" cy="52" r="1.2" fill="#000" />
          <circle cx="53" cy="52" r="1.2" fill="#000" />
        </g>
      )}

      {type === 'glasses_chic' && (
        <g filter={`url(#shadow_${type})`}>
          <path d="M 20 100 C 20 75, 40 70, 50 70 C 60 70, 80 75, 80 100 Z" fill="#7C3AED" />
          <rect x="44" y="58" width="12" height="15" rx="3" fill={`url(#skin_${type})`} />
          <ellipse cx="50" cy="45" rx="16" ry="18" fill={`url(#skin_${type})`} />
          {/* Stylish Bun Hair */}
          <circle cx="50" cy="22" r="8" fill="#451A03" />
          <path d="M 33 38 C 35 22, 65 22, 67 38 Z" fill="#451A03" />
          {/* Red glasses */}
          <circle cx="43" cy="42" r="5" fill="none" stroke="#DC2626" strokeWidth="1.8" />
          <circle cx="57" cy="42" r="5" fill="none" stroke="#DC2626" strokeWidth="1.8" />
          <line x1="48" y1="42" x2="52" y2="42" stroke="#DC2626" strokeWidth="1.8" />
          <circle cx="43" cy="42" r="1.8" fill="#000" />
          <circle cx="57" cy="42" r="1.8" fill="#000" />
          <path d="M 46 53 Q 50 56 54 53" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>
      )}
    </svg>
  );
}

// Universal User Avatar Component supporting Custom Images, 3D Avatars, and Default
export function UserProfileAvatar({ 
  avatarId = 'avatar_1', 
  customPhotoUrl = null, 
  size = 'md',
  className = ''
}: { 
  avatarId?: string; 
  customPhotoUrl?: string | null; 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  if (customPhotoUrl) {
    return (
      <div className={cn("rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100", sizeClasses[size], className)}>
        <img src={customPhotoUrl} alt="User Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  const selectedOption = AVATAR_LIST.find(a => a.id === avatarId) || AVATAR_LIST[0];

  return (
    <div className={cn("rounded-full overflow-hidden shrink-0 shadow-2xs", sizeClasses[size], className)}>
      <Render3DAvatar type={selectedOption.svgType} bgColor={selectedOption.bgColor} />
    </div>
  );
}

interface AvatarSelectorModalProps {
  currentAvatarId?: string;
  currentCustomPhoto?: string | null;
  onClose: () => void;
  onSave: (selectedAvatarId: string, customPhoto: string | null) => void;
}

export function AvatarSelectorModal({
  currentAvatarId = 'avatar_1',
  currentCustomPhoto = null,
  onClose,
  onSave
}: AvatarSelectorModalProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(currentAvatarId);
  const [customPhoto, setCustomPhoto] = useState<string | null>(currentCustomPhoto);
  const [showAllAvatars, setShowAllAvatars] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setCustomPhoto(reader.result as string);
          // When a custom photo is uploaded, we still keep or clear avatarId
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setCustomPhoto(null);
    setSelectedAvatarId('avatar_1');
  };

  const handleSelectAvatar = (id: string) => {
    setSelectedAvatarId(id);
    setCustomPhoto(null); // Switching back to 3D avatar
  };

  const handleSave = () => {
    onSave(selectedAvatarId, customPhoto);
    onClose();
  };

  // 12 avatars by default (4 rows x 3 columns) as in user screenshot
  const displayedAvatars = showAllAvatars ? AVATAR_LIST : AVATAR_LIST.slice(0, 12);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
      {/* Hidden inputs for Gallery and Camera */}
      <input 
        ref={galleryInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />
      <input 
        ref={cameraInputRef}
        type="file" 
        accept="image/*" 
        capture="user" 
        className="hidden" 
        onChange={handleFileChange} 
      />

      <div className="bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-slide-up">
        {/* Top Drag Handle */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Ubah Foto Profil</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Action Buttons Row: Ambil Foto, Galeri, Hapus */}
        <div className="flex items-center justify-around px-8 py-2 border-b border-gray-100/80">
          {/* 1. Ambil Foto */}
          <div 
            onClick={handleCameraClick}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#00B26A] flex items-center justify-center text-[#00B26A] group-hover:bg-emerald-50 group-active:scale-95 transition-all shadow-2xs">
              <Camera className="w-7 h-7" strokeWidth={1.8} />
            </div>
            <span className="text-xs font-medium text-gray-700">Ambil Foto</span>
          </div>

          {/* 2. Galeri */}
          <div 
            onClick={handleGalleryClick}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#00B26A] flex items-center justify-center text-[#00B26A] group-hover:bg-emerald-50 group-active:scale-95 transition-all shadow-2xs">
              <ImageIcon className="w-7 h-7" strokeWidth={1.8} />
            </div>
            <span className="text-xs font-medium text-gray-700">Galeri</span>
          </div>

          {/* 3. Hapus */}
          <div 
            onClick={handleRemovePhoto}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#00B26A] flex items-center justify-center text-[#00B26A] group-hover:bg-emerald-50 group-active:scale-95 transition-all shadow-2xs">
              <Trash2 className="w-7 h-7" strokeWidth={1.8} />
            </div>
            <span className="text-xs font-medium text-gray-700">Hapus</span>
          </div>
        </div>

        {/* Custom Uploaded Preview (if any selected from Galeri/Camera) */}
        {customPhoto && (
          <div className="mx-6 my-3 p-3 bg-emerald-50/60 border border-[#00B26A]/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00B26A] shadow-xs">
                <img src={customPhoto} alt="Uploaded preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Foto dari Galeri Terpilih</p>
                <p className="text-[11px] text-gray-500">Klik "Simpan" untuk menerapkan foto ini</p>
              </div>
            </div>
            <button 
              onClick={() => setCustomPhoto(null)}
              className="text-xs font-semibold text-rose-500 hover:underline px-2"
            >
              Batal
            </button>
          </div>
        )}

        {/* Scrollable Avatar Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Pilih Avatar</h3>

          {/* 3-Column 3D Avatar Grid */}
          <div className="grid grid-cols-3 gap-y-6 gap-x-4 place-items-center">
            {displayedAvatars.map((avatar) => {
              const isSelected = !customPhoto && selectedAvatarId === avatar.id;

              return (
                <div 
                  key={avatar.id}
                  onClick={() => handleSelectAvatar(avatar.id)}
                  className="relative cursor-pointer group flex flex-col items-center"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full transition-all duration-200 p-0.5",
                    isSelected ? "ring-3 ring-[#00B26A] ring-offset-2 scale-105" : "hover:scale-105 opacity-95 hover:opacity-100"
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Render3DAvatar type={avatar.svgType} bgColor={avatar.bgColor} />
                    </div>
                  </div>

                  {/* Selected Green Checkmark Badge on Bottom Right */}
                  {isSelected && (
                    <div className="absolute -bottom-0.5 right-1 w-5 h-5 bg-[#00B26A] text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Toggle Expand: Lihat Semua Avatar */}
          <div className="flex justify-center mt-6 mb-2">
            <button
              onClick={() => setShowAllAvatars(!showAllAvatars)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#00B26A] hover:underline"
            >
              {showAllAvatars ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Lihat Lebih Sedikit
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Lihat Semua Avatar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sticky Bottom Save Button */}
        <div className="p-4 bg-white border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-[#00B26A] hover:bg-[#009E5E] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all text-center cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
