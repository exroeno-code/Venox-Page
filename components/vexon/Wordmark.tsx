/** Gold circuit V plus the VEXON TECH wordmark; size and weight come from the parent. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <img
        src="/vexon-circuit-v.png"
        alt="V"
        width={512}
        height={512}
        className="mr-[0.04em] inline-block h-[0.95em] w-[0.95em] align-[-0.15em] object-contain"
      />
      EXON <span className="text-chrome">TECH</span>
    </span>
  );
}
