import Image from "next/image";

/** The account holder's photo. Falls back to initials if it ever 404s. */
export function Avatar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/avatar.jpg"
      alt="Olaifa Promise"
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      priority
    />
  );
}
