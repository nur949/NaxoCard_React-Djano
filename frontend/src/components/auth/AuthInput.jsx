import { motion } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const AuthInput = forwardRef(function AuthInput(
  {
    id,
    label,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    icon: Icon,
    trailing,
    autoComplete,
    ...props
  },
  ref
) {
  const active = Boolean(value);

  return (
    <div className="grid gap-1.5">
      <motion.label
        htmlFor={id}
        className={cn(
          "group relative flex items-center rounded-2xl border bg-background/70 backdrop-blur-xl transition-all duration-300 dark:bg-background/35",
          error
            ? "border-red-400/70 shadow-[0_0_0_1px_rgba(248,113,113,0.35)]"
            : "border-border/80 focus-within:border-primary/70 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.28),0_0_24px_rgba(59,130,246,0.12)]"
        )}
        whileFocus={{ scale: 1.01 }}
      >
        {Icon ? <Icon className="ml-4 shrink-0 text-lg text-muted-foreground" aria-hidden="true" /> : null}
        <div className="relative flex-1">
          <span
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 origin-left -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200",
              active && "-translate-y-6 scale-90 text-primary"
            )}
          >
            {label}
          </span>
          <input
            id={id}
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            autoComplete={autoComplete}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className="h-16 w-full bg-transparent pb-2 pl-0 pr-12 pt-6 text-base text-foreground placeholder:text-transparent focus:outline-none"
            placeholder={label}
            {...props}
          />
        </div>
        {trailing ? <div className="mr-3 flex shrink-0 items-center">{trailing}</div> : null}
      </motion.label>
      <motion.p
        id={`${id}-error`}
        initial={false}
        animate={{ height: error ? "auto" : 0, opacity: error ? 1 : 0 }}
        className="overflow-hidden pl-1 text-xs font-medium text-rose-500"
      >
        {error || ""}
      </motion.p>
    </div>
  );
});

export default AuthInput;
