import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}

const buttonStyles = cva("button", {
  variants: {
    variant: {
      primary: "button-primary",
      secondary: "button-secondary",
      ghost: "button-ghost",
      danger: "button-danger",
    },
    size: { normal: "", icon: "button-icon", small: "button-small" },
  },
  defaultVariants: { variant: "primary", size: "normal" },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & { asChild?: boolean; loading?: boolean };

export function Button({
  asChild = false,
  variant,
  size,
  className,
  children,
  disabled = false,
  loading = false,
  onClick,
  onClickCapture,
  type = "button",
  ...props
}: ButtonProps) {
  const blocked = disabled || loading;
  const handleClickCapture: MouseEventHandler<HTMLElement> = (event) => {
    if (blocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    (onClickCapture as MouseEventHandler<HTMLElement> | undefined)?.(event);
  };
  const handleClick: MouseEventHandler<HTMLElement> = (event) => {
    if (blocked) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    (onClick as MouseEventHandler<HTMLElement> | undefined)?.(event);
  };

  const commonProps = {
    ...props,
    className: cn(buttonStyles({ variant, size }), className),
    "aria-busy": loading || props["aria-busy"],
    onClickCapture: handleClickCapture,
    onClick: handleClick,
  };

  if (asChild) {
    const slotChildren = loading
      ? [
          <span
            key="button-spinner"
            className="button-spinner"
            aria-hidden="true"
          />,
          <Slottable key="button-content">{children}</Slottable>,
        ]
      : children;
    return (
      <Slot {...commonProps} aria-disabled={blocked || undefined}>
        {slotChildren}
      </Slot>
    );
  }

  return (
    <button {...commonProps} type={type} disabled={blocked}>
      {loading && <span className="button-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("card", className)} {...props} />;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "brand";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> & {
  id?: string;
  label: string;
  description?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  description,
  error,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    ariaDescribedBy,
    description ? descriptionId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("text-field", className)}>
      <label htmlFor={inputId}>{label}</label>
      <input
        {...inputProps}
        id={inputId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy || undefined}
      />
      {description && (
        <span id={descriptionId} className="text-field-description">
          {description}
        </span>
      )}
      {error && (
        <span
          id={errorId}
          className="text-field-error"
          aria-live="polite"
          aria-atomic="true"
        >
          {error}
        </span>
      )}
    </div>
  );
}

type TabsContextValue = {
  id: string;
  value: string;
  orientation: "horizontal" | "vertical";
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const value = useContext(TabsContext);
  if (!value) throw new Error("Tabs components must be nested inside Tabs.");
  return value;
}

export type TabsProps = {
  children: ReactNode;
  className?: string;
  value?: string;
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (value: string) => void;
};

export function Tabs({
  children,
  className,
  value: controlledValue,
  defaultValue,
  orientation = "horizontal",
  onValueChange,
}: TabsProps) {
  const id = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolledValue;
  const setValue = (next: string) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ id, value, orientation, setValue }}>
      <div className={cn("tabs", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = HTMLAttributes<HTMLDivElement> & { label: string };

export function TabsList({ label, className, ...props }: TabsListProps) {
  const { orientation } = useTabsContext();

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const horizontal = orientation === "horizontal";
    const isRtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const nextKey = horizontal
      ? isRtl
        ? "ArrowLeft"
        : "ArrowRight"
      : "ArrowDown";
    const previousKey = horizontal
      ? isRtl
        ? "ArrowRight"
        : "ArrowLeft"
      : "ArrowUp";

    if (event.key !== nextKey && event.key !== previousKey) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not(:disabled)',
      ),
    );
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0 || tabs.length === 0) return;
    event.preventDefault();
    const direction = event.key === nextKey ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  }

  return (
    <div
      {...props}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={cn("tabs-list", className)}
      onKeyDown={handleKeyDown}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const tabs = useTabsContext();
  const selected = tabs.value === value;
  const safeValue = encodeURIComponent(value);
  const tabId = `${tabs.id}-tab-${safeValue}`;
  const panelId = `${tabs.id}-panel-${safeValue}`;

  return (
    <button
      {...props}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      className={cn("tabs-trigger", className)}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) tabs.setValue(value);
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string }) {
  const tabs = useTabsContext();
  const safeValue = encodeURIComponent(value);
  const tabId = `${tabs.id}-tab-${safeValue}`;
  const panelId = `${tabs.id}-panel-${safeValue}`;
  const selected = tabs.value === value;

  return (
    <div
      {...props}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={selected ? 0 : -1}
      hidden={!selected}
      className={cn("tabs-panel", className)}
    />
  );
}

export function Navigation({
  label,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { label: string }) {
  return (
    <nav
      {...props}
      aria-label={label}
      className={cn("ui-navigation", className)}
    />
  );
}

export function NavigationLink({
  current = false,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { current?: boolean }) {
  return (
    <a
      {...props}
      aria-current={current ? "page" : undefined}
      className={cn("ui-navigation-link", className)}
    />
  );
}

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export const DialogContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="ui-dialog-overlay" />
      <DialogPrimitive.Content
        {...props}
        ref={ref}
        className={cn("ui-dialog-content", className)}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export type StatusTone = "neutral" | "info" | "success" | "pending" | "warning" | "error";

export function StatusBadge({
  label,
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label: string; tone?: StatusTone }) {
  return (
    <span
      {...props}
      className={cn("status-badge", `status-badge-${tone}`, className)}
    >
      <span className="status-badge-dot" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function InlineAlert({
  tone = "info",
  title,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: Exclude<StatusTone, "neutral" | "pending">;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      {...props}
      role={tone === "error" ? "alert" : "note"}
      className={cn("ui-alert", `ui-alert-${tone}`, className)}
    >
      <span className="ui-alert-indicator" aria-hidden="true" />
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Toast({
  tone = "info",
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: Exclude<StatusTone, "neutral" | "pending">;
  children: ReactNode;
}) {
  return (
    <div
      {...props}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn("ui-toast", `ui-toast-${tone}`, className)}
    >
      {children}
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn("skeleton", className)}
    />
  );
}

export function LoadingRegion({
  label,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: string; children?: ReactNode }) {
  return (
    <div
      {...props}
      className={cn("loading-region", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {children ?? <Skeleton className="skeleton-line" />}
    </div>
  );
}

export function formatRupiah(amountMinor: bigint | string, locale = "id-ID") {
  const decimal = typeof amountMinor === "bigint" ? amountMinor.toString() : amountMinor;
  if (!/^-?(?:0|[1-9]\d*)$/.test(decimal)) {
    throw new TypeError("Rupiah amounts must be exact integer strings or bigint values.");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(BigInt(decimal));
}

export function MoneyText({
  amountMinor,
  locale = "id-ID",
  masked = false,
  className,
}: {
  amountMinor: bigint | string;
  locale?: string;
  masked?: boolean;
  className?: string;
}) {
  const hiddenLabel = locale.startsWith("id")
    ? "Jumlah disembunyikan"
    : "Amount hidden";
  const currencyPrefix = locale.startsWith("id") ? "Rp" : "IDR";

  return (
    <span
      className={cn("money", className)}
      aria-label={masked ? hiddenLabel : undefined}
    >
      {masked ? `${currencyPrefix} ••••••` : formatRupiah(amountMinor, locale)}
    </span>
  );
}
