/**
 * Splits text into words wrapped in spans for staggered GSAP animation.
 * Each word gets the class "anim-word" and is hidden + offset via `.gsap-armed .anim-word` in globals.css.
 */
export default function SplitWords({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {children.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <span
            className="anim-word inline-block"
          >
            {word}
          </span>
          {i < children.split(" ").length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  );
}
