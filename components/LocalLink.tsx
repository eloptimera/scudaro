"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./I18nProvider";

/** `next/link` that keeps the visitor in their language. Use it for every internal link. */
export default function LocalLink({ href, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { path } = useI18n();
  return <Link href={path(href)} {...rest} />;
}
