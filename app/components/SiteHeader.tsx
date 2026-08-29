"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Cards", flag: "black" as const },
  { href: "/explore", label: "Explore", flag: "red" as const },
  { href: "/exercises", label: "Exercises", flag: "gold" as const },
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
            <Link
              key={link.href}
              href={link.href}
              className={active ? "active" : undefined}
              aria-current={active ? "page" : undefined}
              data-flag={link.flag}
            >
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
