"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function Header({ accountUrl }: { accountUrl: string | null }) {
  const pathname = usePathname();
  const { count, open } = useCart();

  return (
    <header className="site-header">
      <div className="site-header__pill">
        <nav className="nav nav--left" aria-label="Main menu">
          <Link href="/" className={pathname === "/" ? "is-active" : undefined}>Home</Link>
          <Link href="/products" className={pathname === "/products" ? "is-active" : undefined}>Shop</Link>
          <Link href="/#about">About</Link>
          <Link href="/#contact">Contact</Link>
        </nav>

        <Link href="/" className="brand" aria-label="SCUDARO home">
          <Image src="/logo-white.png" alt="SCUDARO" width={647} height={213} priority />
        </Link>

        <nav className="nav nav--right" aria-label="Account and cart">
          {accountUrl && (
            <a href={accountUrl} className="nav__pill">Log in</a>
          )}
          <button
            className="nav__btn nav__pill nav__pill--solid"
            onClick={open}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            Cart <span className="cart-count">{count}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
