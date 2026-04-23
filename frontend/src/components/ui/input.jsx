import TextField from "@mui/material/TextField";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const Input = forwardRef(({ className, type = "text", ...props }, ref) => (
  <TextField
    inputRef={ref}
    type={type}
    size="small"
    fullWidth
    className={cn(className)}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
