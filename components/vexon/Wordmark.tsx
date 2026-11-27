/** Gold circuit V plus the VEXVANO LABS wordmark; size and weight come from the parent. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <img
        src="/brand/vexvano-labs-v.png"
        alt="V"
        width={512}
        height={512}
        className="mr-[0.04em] inline-block h-[0.95em] w-[0.95em] align-[-0.15em] object-contain"
      />
      EXVANO <span className="text-chrome">LABS</span>
    </span>
  );
}
