/** Splits text into word masks that slide up when a parent gets the `in` class. */
export function Words({ text, base = 0, className = "" }: { text: string; base?: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="mask mr-[0.22em]">
          <span className={className} style={{ transitionDelay: `${base + i * 90}ms` }}>{w}</span>
        </span>
      ))}
    </>
  );
}
