"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const { data: session } = useSession();
  const adRef = useRef<HTMLDivElement>(null);

  if (session?.user && (session.user as any).isPremium) {
    return null;
  }

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).adsbygoogle) {
      try {
        (window as any).adsbygoogle.push({});
      } catch (e) {
        // Ad block or error
      }
    }
  }, []);

  const adStyle: Record<string, string> = {
    auto: "display: block",
    rectangle: "width: 300px; height: 250px",
    horizontal: "width: 728px; height: 90px",
    vertical: "width: 160px; height: 600px",
  };

  return (
    <div className={className}>
      <div className="mb-1 text-center text-xs text-dark-200">Advertisement</div>
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={adStyle}
          data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || "000000000000"}`}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
