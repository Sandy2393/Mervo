import React from "react"

import { cn } from "@/lib/utils"

interface AvatarProps {
  name?: string
  className?: string
}

function initials(name?: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("") || "?"
}

const Avatar: React.FC<AvatarProps> = ({ name = "User", className }) => {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold",
        className
      )}
      aria-label={`${name} avatar`}
    >
      {initials(name)}
    </div>
  )
}

export default Avatar
