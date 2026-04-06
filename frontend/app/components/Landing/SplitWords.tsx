/**
 * Splits text into words wrapped in spans for staggered GSAP animation.
 * Each word gets the class "anim-word" and starts hidden + offset.
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
            style={{ opacity: 0, transform: "translateY(40px)" }}
          >
            {word}
          </span>
          {i < children.split(" ").length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  );
}
