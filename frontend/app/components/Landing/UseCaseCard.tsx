import { ElementType } from "react";

/**
 * Use case card for the use cases section — shows a persona who benefits from Linkkk.
 */
export default function UseCaseCard({
  color,
  icon: Icon,
  role,
  name,
  description,
  tagline,
  light = false,
  className = "",
}: {
  color: string;
  icon: ElementType;
  role: string;
  name: string;
  description: string;
  tagline: string;
  light?: boolean;
  className?: string;
}) {
  const text = light ? "text-light" : "text-dark";
  const textMuted = light ? "text-light/50" : "text-dark/50";
  const textBody = light ? "text-light/75" : "text-dark/75";
  const textTagline = light ? "text-light/60" : "text-dark/60";
  const border = light ? "border-light/15" : "border-dark/15";
  const iconColor = light ? "text-light/10" : "text-dark/10";

  return (
    <div
      className={`${color} ${className} relative w-44 md:w-52 h-56 md:h-60 rounded-2xl p-4 md:p-5 flex flex-col justify-between shrink-0 overflow-hidden`}
    >
      {/* Decorative icon — large, bottom-right, semi-transparent */}
      <Icon
        size={100}
        strokeWidth={3}
        className={`absolute -bottom-3 -right-3 -rotate-45 pointer-events-none select-none ${iconColor}`}
      />

      {/* Top: identity */}
      <div>
        <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-wider ${textMuted} mb-0.5`}>{role}</p>
        <h3 className={`font-black italic text-base md:text-lg ${text} leading-tight`}>{name}</h3>
      </div>

      {/* Middle: description */}
      <p className={`text-[11px] md:text-xs ${textBody} leading-snug`}>{description}</p>

      {/* Bottom: tagline */}
      <p className={`text-[11px] md:text-xs font-bold ${textTagline} leading-snug border-t ${border} pt-2`}>{tagline}</p>
    </div>
  );
}
