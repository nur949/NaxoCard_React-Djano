import MuiCard from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import MuiCardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";

const Card = forwardRef(({ className, ...props }, ref) => (
  <MuiCard ref={ref} className={cn("text-card-foreground", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <MuiCardHeader ref={ref} className={cn("p-6", className)} title={children} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <Typography ref={ref} variant="h5" className={cn("font-bold", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <Typography ref={ref} variant="body2" color="text.secondary" className={className} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <MuiCardContent ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
