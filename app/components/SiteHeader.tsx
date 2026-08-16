"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Cards" },
  { href: "/explore", label: "Explore" },
  { href: "/exercises", label: "Exercises" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span>German1000</span>
      </Link>
      <nav className="topnav" aria-label="Primary navigation">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
