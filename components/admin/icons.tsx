type IconProps = { className?: string };

export function InfoIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4.5 7 12 13l7.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5 15.2 15.2" strokeLinecap="round" />
    </svg>
  );
}

export function GridIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <path d="M4 11 12 4l8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5.5h4V20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarBadgeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5 15 9.1l7.2.7-5.4 4.8 1.6 7.1L12 18l-6.4 3.7 1.6-7.1L1.8 9.8l7.2-.7L12 2.5Z" />
    </svg>
  );
}

export function TicketStackIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <path
        d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.1a2 2 0 1 0 0 4.8V15.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.1a2 2 0 1 0 0-4.8V8.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 7v10" strokeDasharray="1.6 2" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <path d="M6.5 3.5h7l4 4v13a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M13.5 3.5v4h4" strokeLinejoin="round" />
      <path d="M8.5 12.5h7M8.5 16h7M8.5 9h3" strokeLinecap="round" />
    </svg>
  );
}

export function QuestionIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.3a2.4 2.4 0 1 1 3.5 2.1c-.8.5-1.1.9-1.1 1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 6H6a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 6 19h10a1.5 1.5 0 0 0 1.5-1.5V15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 4.5h6v6M19 5l-9 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UsersIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 5.3a3 3 0 0 1 0 5.9" strokeLinecap="round" />
      <path d="M17 13.9c2.3.6 3.9 2.6 3.9 5.1" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 8 7 9 4-1 7-4.6 7-9V6l-7-2.5Z" strokeLinejoin="round" />
      <path d="M9 12.2 11.2 14.4 15.5 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.3 3.7 5.2 3.7 8.5s-1.3 6.2-3.7 8.5c-2.4-2.3-3.7-5.2-3.7-8.5S9.6 5.8 12 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8l4 4-4 4M18 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <path d="M2 12C4.5 6.5 9 4 12 4s7.5 2.5 10 8c-2.5 5.5-7 8-10 8s-7.5-2.5-10-8Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.7}>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.5 10.7A3 3 0 0 0 13.3 13.5" strokeLinecap="round" />
      <path d="M6.9 6.9C4.9 8.3 3.3 10 2 12c2.5 5.5 7 8 10 8 1.6 0 3.3-.5 4.8-1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.4 17.4C19.3 15.9 21 13.9 22 12c-2.5-5.5-7-8-10-8-1.2 0-2.5.3-3.7.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
