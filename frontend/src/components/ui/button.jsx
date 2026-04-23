import MuiButton from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Children, forwardRef, isValidElement } from "react";
import { cn } from "../../lib/utils.js";

function mapVariant(variant) {
  if (variant === "outline") return "outlined";
  if (variant === "ghost") return "text";
  if (variant === "destructive") return "contained";
  if (variant === "secondary") return "contained";
  return "contained";
}

function mapColor(variant) {
  if (variant === "destructive") return "error";
  if (variant === "secondary") return "secondary";
  return "primary";
}

function mapSize(size) {
  if (size === "sm") return "small";
  if (size === "lg") return "large";
  return "medium";
}

const Button = forwardRef(({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
  if (asChild) {
    const child = Children.only(children);

    if (!isValidElement(child)) {
      return null;
    }

    return (
      <MuiButton
        component={child.type}
        ref={ref}
        variant={mapVariant(variant)}
        color={mapColor(variant)}
        size={mapSize(size)}
        className={cn("gap-2", child.props.className, className)}
        {...props}
        {...child.props}
      >
        {child.props.children}
      </MuiButton>
    );
  }

  if (size === "icon") {
    return (
      <IconButton
        ref={ref}
        color={mapColor(variant)}
        className={cn("rounded-md", className)}
        {...props}
      >
        {children}
      </IconButton>
    );
  }

  return (
    <MuiButton
      ref={ref}
      variant={mapVariant(variant)}
      color={mapColor(variant)}
      size={mapSize(size)}
      className={cn("gap-2", className)}
      {...props}
    >
      {children}
    </MuiButton>
  );
});

Button.displayName = "Button";

export { Button };
