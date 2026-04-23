import Chip from "@mui/material/Chip";
import { cn } from "../../lib/utils.js";

function mapColor(variant) {
  if (variant === "accent") return "warning";
  if (variant === "destructive") return "error";
  if (variant === "secondary") return "secondary";
  return "primary";
}

function Badge({ className, variant = "default", children, ...props }) {
  return (
    <Chip
      size="small"
      color={mapColor(variant)}
      variant={variant === "outline" ? "outlined" : "filled"}
      label={children}
      className={cn(className)}
      {...props}
    />
  );
}

export { Badge };
