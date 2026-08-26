"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Liquid } from "liquid-gooey";
import { Glass } from "@samasante/liquid-glass";

const GLASS_TINT = "rgba(24, 35, 44, 0.3)";

type NavDest = {
  href: string;
  label: string;
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
  { href: "/", label: "Cards", icon: CardsIcon },
  { href: "/explore", label: "Explore", icon: ExploreIcon },
  { href: "/exercises", label: "Exercises", icon: ExercisesIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside press or Escape while open.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={open ? "bottom-nav bottom-nav--open" : "bottom-nav"}
    >
      <nav
        id="bottom-nav-menu"
        aria-label="Primary navigation"
        className="bottom-nav__stage"
      >
        <Liquid
          className="bn-liquid"
          blur={12}
          contrast={20}
          fill="rgba(24, 35, 44, 0)"
          shadow="0 10px 26px rgba(24, 35, 44, 0.2)"
          filterPadding={32}
        >
          <Liquid.Item className="bn-item">
            <Glass
              className="bn-pill"
              style={{ background: GLASS_TINT, borderRadius: 999 }}
              optics={{
                mapSize: 160,
                strength: 0.14,
                depth: 0.95,
                curvature: 0.5,
                dispersion: 0.2,
                bend: 0.4,
                bendWidth: 0.07,
                sheen: 1.2,
                sheenWidth: 3.5,
                specular: 1.6,
                sheenAngle: 0,
                frost: 0,
                restEdgeShadow: "0 6px 22px rgba(24, 35, 44, 0.24)",
                edgeShadow: "0 10px 30px rgba(24, 35, 44, 0.28)",
              }}
            >
              <div className="bn-pill__row">
                {destinations.map((destination) => {
                  const active = pathname === destination.href;
                  const Icon = destination.icon;
                  return (
                    <Link
                      key={destination.href}
                      href={destination.href}
                      className={
                        active
                          ? "bn-navlink bn-navlink--active"
                          : "bn-navlink"
                      }
                      aria-current={active ? "page" : undefined}
                      aria-label={destination.label}
                      tabIndex={open ? undefined : -1}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="bn-icon" />
                    </Link>
                  );
                })}
                <button
                  type="button"
                  ref={triggerRef}
                  className="bn-trigger"
                  aria-expanded={open}
                  aria-controls="bottom-nav-menu"
                  aria-label={open ? "Close navigation" : "Open navigation"}
                  onClick={() => setOpen((current) => !current)}
                >
                  <span className="bn-plus" aria-hidden="true" />
                </button>
              </div>
            </Glass>
          </Liquid.Item>
        </Liquid>
      </nav>
    </div>
  );
}
