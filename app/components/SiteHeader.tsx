"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Cards", index: "01" },
  { href: "/explore", label: "Explore", index: "02" },
  { href: "/exercises", label: "Exercises", index: "03" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">de</span>
        <span>GERMAN 1000</span>
      </Link>
      <nav className="topnav" aria-label="Primary navigation">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
              <span className="nav-index">{link.index}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <span className="top-note">1,000 forms · no account</span>
    </header>
  );
}
