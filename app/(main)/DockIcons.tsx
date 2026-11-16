import React from 'react'

function DockIconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        {children}
      </g>
    </svg>
  )
}

function MiniIconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/** Duotone writing/blog icon (18x18). */
export function WritingIcon() {
  return (
    <DockIconBase>
      <circle
        cx="5.5"
        cy="5.5"
        r="2.75"
        fill="currentColor"
        opacity=".3"
        strokeWidth="0"
        stroke="none"
      />
      <line x1="15.25" y1="11.75" x2="2.75" y2="11.75" />
      <line x1="9.25" y1="15.25" x2="2.75" y2="15.25" />
      <circle cx="5.5" cy="5.5" r="2.75" />
    </DockIconBase>
  )
}

/** Duotone sparkle icon for AI section (18x18). */
export function AiSparkIcon() {
  return (
    <DockIconBase>
      <path
        d="M8.5 2.25L10.15 6.35L14.25 8L10.15 9.65L8.5 13.75L6.85 9.65L2.75 8L6.85 6.35L8.5 2.25Z"
        fill="currentColor"
        opacity=".3"
        strokeWidth="0"
        stroke="none"
      />
      <path d="M8.5 2.25L10.15 6.35L14.25 8L10.15 9.65L8.5 13.75L6.85 9.65L2.75 8L6.85 6.35L8.5 2.25Z" />
      <path d="M14 12.25v3M12.5 13.75h3" />
    </DockIconBase>
  )
}

/** Duotone guestbook speech-bubble icon (18x18). */
export function GuestbookIcon() {
  return (
    <DockIconBase>
      <path
        d="M9 2.25c-3.728 0-6.75 2.798-6.75 6.25 0 1.603.652 3.064 1.723 4.17L3.25 15.75l3.397-1.13c.74.278 1.533.43 2.353.43 3.728 0 6.75-2.798 6.75-6.25S12.728 2.25 9 2.25Z"
        fill="currentColor"
        opacity=".3"
        strokeWidth="0"
        stroke="none"
      />
      <path d="M9 2.25c-3.728 0-6.75 2.798-6.75 6.25 0 1.603.652 3.064 1.723 4.17L3.25 15.75l3.397-1.13c.74.278 1.533.43 2.353.43 3.728 0 6.75-2.798 6.75-6.25S12.728 2.25 9 2.25Z" />
      <line x1="6.25" y1="7.5" x2="11.75" y2="7.5" />
      <line x1="6.25" y1="10.25" x2="9.75" y2="10.25" />
    </DockIconBase>
  )
}

/** Duotone person silhouette icon for About page (18x18). */
export function AboutIcon() {
  return (
    <DockIconBase>
      <circle
        cx="9"
        cy="5.75"
        r="2.75"
        fill="currentColor"
        opacity=".3"
        strokeWidth="0"
        stroke="none"
      />
      <path
        d="M3.75 14.75c0-2.485 2.35-4.5 5.25-4.5s5.25 2.015 5.25 4.5v.5H3.75v-.5Z"
        fill="currentColor"
        opacity=".3"
        strokeWidth="0"
        stroke="none"
      />
      <circle cx="9" cy="5.75" r="2.75" />
      <path d="M3.75 15.25v-.5c0-2.485 2.35-4.5 5.25-4.5s5.25 2.015 5.25 4.5v.5" />
    </DockIconBase>
  )
}

/** Duotone projects pencil-and-ruler icon (18x18). */
export function ProjectsIcon() {
  return (
    <DockIconBase>
      <path d="M10.487 14.584L12.255 12.816" />
      <path d="M8.46698 12.563L11.798 15.894C12.189 16.285 12.822 16.285 13.212 15.894L15.894 13.212C16.285 12.821 16.285 12.188 15.894 11.798L14.685 10.589" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1711 6.85988L11.1411 3.8299L3.766 11.205C2.82897 12.142 2.263 15.6755 2.25119 15.7498C2.2504 15.7499 2.25 15.75 2.25 15.75L2.251 15.751C2.251 15.751 2.25106 15.7506 2.25119 15.7498C2.32546 15.738 5.85897 15.172 6.796 14.235L14.1711 6.85988Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="none"
      />
      <path d="M9.53299 5.43699L6.20199 2.10599C5.81099 1.71499 5.17799 1.71499 4.78799 2.10599L2.10599 4.78799C1.71499 5.17899 1.71499 5.81199 2.10599 6.20199L5.43699 9.53299" />
      <path d="M3.41599 7.513L5.18398 5.745" />
      <path d="M2.25 15.75C2.25 15.75 5.849 15.182 6.796 14.235C7.743 13.288 15.373 5.65799 15.373 5.65799C16.21 4.82099 16.21 3.46399 15.373 2.62799C14.536 1.79099 13.179 1.79099 12.343 2.62799C12.343 2.62799 4.713 10.258 3.766 11.205C2.819 12.152 2.251 15.751 2.251 15.751L2.25 15.75Z" />
      <path d="M11.121 3.84802L14.152 6.87902" />
    </DockIconBase>
  )
}

/** Duotone AMA chat-clock icon (18x18). */
export function AmaIcon() {
  return (
    <DockIconBase>
      <path
        d="M9 2.25c-3.728 0-6.75 2.798-6.75 6.25 0 1.603.652 3.064 1.723 4.17L3.25 15.75l3.397-1.13c.74.278 1.533.43 2.353.43 3.728 0 6.75-2.798 6.75-6.25S12.728 2.25 9 2.25Z"
        fill="currentColor"
        opacity=".3"
        strokeWidth="0"
        stroke="none"
      />
      <path d="M9 2.25c-3.728 0-6.75 2.798-6.75 6.25 0 1.603.652 3.064 1.723 4.17L3.25 15.75l3.397-1.13c.74.278 1.533.43 2.353.43 3.728 0 6.75-2.798 6.75-6.25S12.728 2.25 9 2.25Z" />
      <path d="M9 5.75V8.5l1.875 1.375" />
    </DockIconBase>
  )
}

/** Duotone sliders icon for dock preferences (18x18). */
export function PreferencesIcon() {
  return (
    <DockIconBase>
      <path
        d="M11 7.5C12.2426 7.5 13.25 6.49264 13.25 5.25C13.25 4.00736 12.2426 3 11 3C9.75736 3 8.75 4.00736 8.75 5.25C8.75 6.49264 9.75736 7.5 11 7.5Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="none"
      />
      <path
        d="M7 15C8.24264 15 9.25 13.9926 9.25 12.75C9.25 11.5074 8.24264 10.5 7 10.5C5.75736 10.5 4.75 11.5074 4.75 12.75C4.75 13.9926 5.75736 15 7 15Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="none"
      />
      <path d="M13.25 5.25H16.25" />
      <path d="M1.75 5.25H8.75" />
      <path d="M11 7.5C12.2426 7.5 13.25 6.49264 13.25 5.25C13.25 4.00736 12.2426 3 11 3C9.75736 3 8.75 4.00736 8.75 5.25C8.75 6.49264 9.75736 7.5 11 7.5Z" />
      <path d="M4.75 12.75H1.75" />
      <path d="M16.25 12.75H9.25" />
      <path d="M7 15C8.24264 15 9.25 13.9926 9.25 12.75C9.25 11.5074 8.24264 10.5 7 10.5C5.75736 10.5 4.75 11.5074 4.75 12.75C4.75 13.9926 5.75736 15 7 15Z" />
    </DockIconBase>
  )
}

/** Small sun icon for light theme toggle (15x15). */
export function SunMiniIcon() {
  return (
    <MiniIconBase>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.75v1.25M8 13v1.25M1.75 8H3M13 8h1.25M3.58 3.58l.88.88M11.54 11.54l.88.88M12.42 3.58l-.88.88M4.46 11.54l-.88.88" />
    </MiniIconBase>
  )
}

/** Small monitor icon for system theme toggle (15x15). */
export function MonitorMiniIcon() {
  return (
    <MiniIconBase>
      <rect x="2" y="2.5" width="12" height="8.5" rx="1.5" />
      <path d="M5.5 13.5h5M8 11v2.5" />
    </MiniIconBase>
  )
}

/** Small moon icon for dark theme toggle (15x15). */
export function MoonMiniIcon() {
  return (
    <MiniIconBase>
      <path d="M13.25 9.45A5.25 5.25 0 0 1 6.55 2.75a5.25 5.25 0 1 0 6.7 6.7Z" />
    </MiniIconBase>
  )
}
