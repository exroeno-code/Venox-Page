/** The VEXON TECH wordmark: "TECH" in the silver gradient. Size and weight come from the parent. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      VEXON <span className="text-chrome">TECH</span>
    </span>
  );
}
