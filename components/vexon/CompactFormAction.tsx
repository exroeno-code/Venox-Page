import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
} from "react";
import type { LucideProps } from "lucide-react";

type Icon = ComponentType<LucideProps>;

type CompactFormActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: Icon;
  children: ReactNode;
};

/**
 * Form action that stays icon-sized on large screens and reveals its label on
 * hover or keyboard focus. It remains a normal, labeled button for touch and
 * smaller screens.
 */
export function CompactFormAction({
  icon: Icon,
  children,
  className = "",
  ...props
}: CompactFormActionProps) {
  return (
    <button {...props} className={`compact-form-action ${className}`.trim()}>
      <Icon aria-hidden="true" className="compact-form-action__icon" />
      <span className="compact-form-action__label">{children}</span>
    </button>
  );
}

type CompactFormLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: Icon;
  children: ReactNode;
};

export function CompactFormLink({
  icon: Icon,
  children,
  className = "",
  ...props
}: CompactFormLinkProps) {
  return (
    <a {...props} className={`compact-form-action ${className}`.trim()}>
      <Icon aria-hidden="true" className="compact-form-action__icon" />
      <span className="compact-form-action__label">{children}</span>
    </a>
  );
}
