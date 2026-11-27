import type { ServiceIconName } from "../data";

export function RecycleMark() {
  return (
    <svg viewBox="0 0 68 64" fill="currentColor" aria-hidden="true">
      <path d="M24 3h17l11 18 6-3-6 18-19-3 7-4L29 10l-8 13-9-5z" />
      <path d="m57 36 8 14-8 12H36v-9h20l-9-16z" />
      <path d="m40 47-12 12 12 5z" />
      <path d="M27 60H10L2 46l11-19-6-4 19-2 6 18-7-4-10 18h14z" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4.1Z" />
      <path
        d="m8.1 7.2 1.4 2.4-.9 1.1c.8 1.6 2 2.7 3.7 3.4l1-1 2.5 1.2c-.2 1.5-1.1 2.2-2.3 2-3.2-.6-6.4-3.8-7-6.8-.2-1 .5-2 1.6-2.3Z"
        fill="currentColor"
        strokeWidth=".5"
      />
    </svg>
  );
}

export function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m20.7 4.5-3.1 15c-.2 1.1-.9 1.3-1.8.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8 8.8-8c.4-.3-.1-.5-.6-.2L5.5 13.4.8 11.9c-1-.3-1-1 .2-1.5L19.4 3c.9-.3 1.6.2 1.3 1.5Z" />
    </svg>
  );
}

export function VkIcon() {
  return (
    <svg viewBox="0 0 28 24" fill="currentColor" aria-hidden="true">
      <path d="M14.9 19.7C5.8 19.7.6 13.5.3 3.2h4.6c.2 7.5 3.5 10.7 6.1 11.4V3.2h4.3v6.5c2.6-.3 5.4-3.3 6.3-6.5h4.3c-.7 4-3.7 7-5.8 8.3 2.1 1.1 5.5 3.8 6.8 8.2h-4.8c-1-3.1-3.6-5.5-6.8-5.8v5.8Z" />
    </svg>
  );
}

export function ServiceIcon({ name }: { name: ServiceIconName }) {
  const content = {
    home: (
      <>
        <path d="m7 24 25-21 25 21-5 5-20-17L12 29z" />
        <path d="M14 27v27h36V27L32 12z" />
        <path d="M27 35h11v19H27z" fill="var(--service-icon-cutout, #f1f5ff)" />
        <path d="M45 7h6v15l-6-5z" />
      </>
    ),
    roller: (
      <>
        <rect x="10" y="5" width="39" height="16" rx="5" />
        <rect
          x="14"
          y="9"
          width="31"
          height="4"
          rx="2"
          fill="var(--service-icon-cutout, #f1f5ff)"
        />
        <path d="M49 13h7v15H34v10h-6V23h23v-6h-2z" />
        <rect x="25" y="34" width="13" height="24" rx="4" />
      </>
    ),
    truck: (
      <>
        <path d="M4 11h38l-7 27H0zM44 20h10l9 13v15H41V30z" />
        <path
          d="m47 24-2 10h12l-7-10zM11 16h5l-4 15H7zm12 0h5l-4 15h-5zm12 0h4l-4 15h-4z"
          fill="var(--service-icon-cutout, #f1f5ff)"
        />
        <circle cx="13" cy="46" r="9" />
        <circle cx="49" cy="46" r="9" />
        <circle
          cx="13"
          cy="46"
          r="4"
          fill="var(--service-icon-cutout, #f1f5ff)"
        />
        <circle
          cx="49"
          cy="46"
          r="4"
          fill="var(--service-icon-cutout, #f1f5ff)"
        />
      </>
    ),
    sofa: (
      <>
        <rect x="9" y="8" width="46" height="27" rx="6" />
        <rect x="3" y="24" width="10" height="23" rx="4" />
        <rect x="51" y="24" width="10" height="23" rx="4" />
        <rect x="10" y="36" width="44" height="13" rx="2" />
        <path d="M11 49h6v7h-6zm36 0h6v7h-6z" />
        <path
          d="M32 10v23M15 34h34"
          stroke="var(--service-icon-cutout, #f1f5ff)"
          strokeWidth="2"
        />
      </>
    ),
    bags: (
      <>
        <path d="m10 18 5-2 8 1 6 12c6 13 3 24-11 24S2 45 7 32l7-10zM14 14 9 6l8 3 7-5-1 10zm24 17 5-2 7 1 7 12c4 9 1 16-10 16s-15-7-10-16l5-8zM41 27l-4-7 8 2 6-5-1 10zM35 9l5-5 6 7-4 9-7-3z" />
        <path
          d="m15 23-5 16m34-3-4 12M20 23l5 15"
          stroke="var(--service-icon-cutout, #f1f5ff)"
          strokeWidth="1.6"
        />
      </>
    ),
    worker: (
      <>
        <path d="M16 21C16 9 22 3 32 3s16 6 16 18l5 3H11zM26 2h12v19H26zM20 28h24v8c0 9-6 14-12 14s-12-5-12-14z" />
        <path d="m20 42-12 7-4 12h56l-4-12-12-7-12 12z" />
        <path
          d="M27 4v15m10-15v15M26 48l-4 13m16-13 4 13M23 30h18"
          stroke="var(--service-icon-cutout, #f1f5ff)"
          strokeWidth="2"
        />
      </>
    ),
    excavator: (
      <>
        <path d="M33 30h17v17H30V35zM35 23h11l6 10H34z" />
        <path d="M37 26h7l3 6H36z" fill="var(--service-icon-cutout, #f1f5ff)" />
        <rect x="26" y="47" width="33" height="10" rx="5" />
        <path d="m32 33-8-19-5-3L6 37l5 3 10-19 6 15zM5 36 0 48l11 2 5-11-6 3z" />
        <path
          d="M30 52h25"
          stroke="var(--service-icon-cutout, #f1f5ff)"
          strokeWidth="2"
        />
      </>
    ),
  };
  return (
    <svg
      className={`service-icon service-icon-${name}`}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
    >
      {content[name]}
    </svg>
  );
}
