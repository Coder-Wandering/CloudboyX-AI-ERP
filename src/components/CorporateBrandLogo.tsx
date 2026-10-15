import React, { useState } from 'react';
import { BRAND_LOGO_SRC, BRAND_LOGO_FILE, BRAND_LOGO_PUBLIC } from './brandLogoData';

interface CorporateBrandLogoProps {
  className?: string;
  variant?: 'full' | 'mark';
  id?: string;
  alt?: string;
}

/**
 * Official Corporate Brand Logo.
 * Renders the authentic hexagonal mountain peaks logo on a crisp white background badge.
 */
export const CorporateBrandLogo: React.FC<CorporateBrandLogoProps> = ({ 
  className = "w-10 h-10", 
  variant = 'full',
  id = "brand-official-logo",
  alt = "Official Brand Logo"
}) => {
  const [imgSrc, setImgSrc] = useState<string>(BRAND_LOGO_SRC);

  return (
    <img
      id={id}
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc === BRAND_LOGO_SRC) {
          setImgSrc(BRAND_LOGO_FILE);
        } else if (imgSrc === BRAND_LOGO_FILE) {
          setImgSrc(BRAND_LOGO_PUBLIC);
        }
      }}
      className={`${className} object-contain shrink-0 select-none`}
      loading="eager"
      decoding="async"
    />
  );
};

export default CorporateBrandLogo;

