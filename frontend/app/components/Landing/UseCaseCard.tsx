/**
 * Use case card for the use cases section.
 */
export default function UseCaseCard({
  color,
  title,
  description,
  footer,
  className = "",
}: {
  color: string;
  title: string;
  description: string;
  footer: string;
  className?: string;
}) {
  return (
    <div
      className={`${color} ${className} aspect-square w-44 md:w-48 rounded-2xl p-4 md:p-5 flex flex-col justify-start gap-2`}
    >
      <div>
        <h3 className="font-black italic text-base md:text-lg text-dark leading-tight mb-2 md:mb-3">
          {title}
        </h3>
        <p className="text-[11px] md:text-xs text-dark/80 leading-snug">
          {description}
        </p>
      </div>
      {footer && (
        <p className="text-[11px] md:text-xs text-dark/80 leading-snug">
          {footer}
        </p>
      )}
    </div>
  );
}
