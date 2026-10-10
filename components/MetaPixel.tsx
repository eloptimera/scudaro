"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsent, type Consent } from "@/lib/consent";
import { clearPixelCookies, loadPixel } from "@/lib/pixel";

/** Starts the Meta Pixel only after the visitor has accepted marketing cookies; sends PageView on every navigation. */
export default function MetaPixel() {
  const pathname = usePathname();
  const granted = useRef(false);
  const first = useRef(true);

  const start = () => {
    loadPixel();
    window.fbq?.("track", "PageView");
    for (const [event, params] of window.__pixelQueue?.splice(0) ?? []) window.fbq?.("track", event, params);
  };

  useEffect(() => {
    const apply = (value: Consent | null) => {
      if (value === "granted" && !granted.current) {
        granted.current = true;
        start();
      } else if (value === "denied") {
        window.__pixelQueue = [];
        if (granted.current) {
          granted.current = false;
          window.fbq?.("consent", "revoke");
          clearPixelCookies();
        }
      }
    };
    apply(readConsent());
    const onChange = (e: Event) => apply((e as CustomEvent<Consent>).detail);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // Client-side navigations are not page loads, so each one is reported separately (the first is covered by start()).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (granted.current) window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
