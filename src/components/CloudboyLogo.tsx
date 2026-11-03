import React from "react";
import { CLOUDBOYX_OFFICIAL_LOGO } from "./brandLogoData";

interface CloudboyLogoProps {
  className?: string; // Standard className support
  size?: number;      // Size in pixels (default 40)
  animated?: boolean; // Enable hover animation
}

export default function CloudboyLogo({ className = "", size = 40, animated = true }: CloudboyLogoProps) {
  return (
    <img
      src={CLOUDBOYX_OFFICIAL_LOGO}
      alt="CloudboyX Logo"
      style={{ width: size, height: 'auto', maxHeight: size }}
      className={`object-contain rounded shrink-0 select-none ${className} ${animated ? 'hover:scale-105 transition-transform duration-200' : ''}`}
      loading="eager"
      decoding="async"
    />
  );
}
