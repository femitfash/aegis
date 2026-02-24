"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

/**
 * User avatar menu with sign-out functionality.
 * Displayed in the dashboard sidebar footer.
 */
export function UserMenu() {
  const { user, signOut, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="flex-1">
          <div className="h-3 bg-muted rounded w-20 animate-pulse" />
          <div className="h-2 bg-muted rounded w-28 mt-1 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";
  const email = user.email || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-md border bg-popover shadow-md z-50">
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-sm text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOutIcon />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 text-muted-foreground transition-transform ${
        isOpen ? "rotate-180" : ""
      }`}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}
