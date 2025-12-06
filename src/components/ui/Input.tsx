import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "./label"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, ...props }, ref) => {
    const input = (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (label) {
      return (
        <div className="space-y-2">
          <Label>{label}</Label>
          {input}
          {helperText && <p className="text-sm text-muted-foreground">{helperText}</p>}
        </div>
      )
    }

    return input
  }
)
Input.displayName = "Input"

export { Input }
