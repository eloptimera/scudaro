import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

/**
 * Language routing. English is the default and has no prefix (`/products`); every other language lives under
 * its own prefix (`/de/products`). Internally everything is served from `app/[locale]`, so English requests are
 * rewritten to `/en/...`. A visitor who picked a language in the switcher gets sent there on their next visit.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];

  // `/en/...` is not a public URL: send it to the unprefixed one.
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Already a language-prefixed URL.
  if (isLocale(first)) return NextResponse.next();

  // Unprefixed: honour a remembered language choice, otherwise serve English.
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved) && saved !== DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = `/${saved}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (images, audio, fonts, robots…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
