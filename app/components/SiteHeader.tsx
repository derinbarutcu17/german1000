"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProgressBar } from "./ProgressBar";

const links = [
  { href: "/", label: "Today", index: "01" },
  { href: "/explore", label: "Explore", index: "02" },
  { href: "/exercises", label: "Exercises", index: "03" },
  { href: "/method", label: "Method", index: "04" },
];

export function SiteHeader({ knownCount, total }: { knownCount: number; total: number }) {
  const pathname = usePathname();
  const percentage = total ? Math.round((knownCount / total) * 100) : 0;
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
      <div className="top-progress">
        <span>{knownCount.toLocaleString()}/{total.toLocaleString()}</span>
        <ProgressBar value={knownCount} max={total} label={knownCount + " of " + total + " words marked known"} compact />
        <span className="top-progress-percent">{percentage}%</span>
      </div>
    </header>
  );
}

