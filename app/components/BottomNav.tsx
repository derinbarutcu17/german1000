"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavDest = {
  href: string;
  label: string;
  flag: "black" | "red" | "gold";
  icon: (props: { className?: string }) => React.ReactElement;
};

function CardsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="13" height="13" rx="2.5" />
      <path d="M7.5 7V5.5A2.5 2.5 0 0 1 10 3h8.5A2.5 2.5 0 0 1 21 5.5V14a2.5 2.5 0 0 1-2.5 2.5H17" />
    </svg>
  );
}

function ExploreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.75" />
      <path d="M16.25 16.25 20.5 20.5" />
    </svg>
  );
}

function ExercisesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.75" />
      <path d="m8.6 12.4 2.3 2.3 4.5-5" />
    </svg>
  );
}

const destinations: NavDest[] = [
  { href: "/", label: "Cards", flag: "black", icon: CardsIcon },
  { href: "/explore", label: "Explore", flag: "red", icon: ExploreIcon },
  { href: "/exercises", label: "Exercises", flag: "gold", icon: ExercisesIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="bottom-nav">
      <nav aria-label="Primary navigation" className="bottom-nav__bar">
        {destinations.map((destination) => {
          const active = pathname === destination.href;
          const Icon = destination.icon;
          return (
            <Link
              key={destination.href}
              href={destination.href}
              className={active ? "bottom-nav__link bottom-nav__link--active" : "bottom-nav__link"}
              aria-current={active ? "page" : undefined}
              data-flag={destination.flag}
            >
              <Icon className="bottom-nav__icon" />
              <span className="bottom-nav__label">{destination.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
