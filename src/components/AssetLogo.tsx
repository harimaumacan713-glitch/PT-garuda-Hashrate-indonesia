import React, { useState } from 'react';
import { getAssetLogo, getAssetBrandColor } from '../lib/assetsData';
import { cn } from '../lib/utils';

interface AssetLogoProps {
  symbol: string;
  className?: string;
  imgClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
}

export function AssetLogo({
  symbol,
  className,
  imgClassName,
  size = 'md',
  fallbackText
}: AssetLogoProps) {
  const [hasError, setHasError] = useState(false);
  
  React.useEffect(() => {
    setHasError(false);
  }, [symbol]);

  const logoUrl = getAssetLogo(symbol);
  const cleanSymbol = (symbol || '').toUpperCase().replace('USDT', '');
  const brandColor = getAssetBrandColor(cleanSymbol);

  const sizeClasses = {
    xs: 'w-5 h-5 min-w-[20px] text-[9px]',
    sm: 'w-7 h-7 min-w-[28px] text-[10px]',
    md: 'w-10 h-10 min-w-[40px] text-xs',
    lg: 'w-12 h-12 min-w-[48px] text-sm',
    xl: 'w-14 h-14 min-w-[56px] text-base'
  };

  const displayText = fallbackText || cleanSymbol.slice(0, 4);

  return (
    <div
      className={cn(
        "rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 shadow-2xs relative",
        sizeClasses[size],
        className
      )}
    >
      {!hasError && logoUrl ? (
        <img
          src={logoUrl}
          alt={`${cleanSymbol} logo`}
          referrerPolicy="no-referrer"
          loading="eager"
          className={cn(
            "w-full h-full object-cover transition-transform",
            imgClassName
          )}
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-black tracking-tighter text-white shadow-inner uppercase"
          style={{ backgroundColor: brandColor }}
        >
          {displayText}
        </div>
      )}
    </div>
  );
}
