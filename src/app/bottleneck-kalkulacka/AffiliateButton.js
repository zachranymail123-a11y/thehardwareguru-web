'use client';

import React from 'react';

/**
 * CLIENT-SIDE WRAPPER FOR AFFILIATE TRACKING
 */
export default function AffiliateButton({ href, label, children, className, positionId }) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'bottleneck_hub',
        event_label: label,
      });
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      className={className} 
      target="_blank" 
      rel="nofollow sponsored noopener noreferrer"
      {...(positionId ? { 'data-trixam-positionid': positionId } : {})}
    >
      {children}
    </a>
  );
}
