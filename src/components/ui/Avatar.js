import { jsx as _jsx } from "react/jsx-runtime";
import clsx from "clsx";
export default function Avatar({ name, size = 32, src }) {
    const initials = name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return src ? (_jsx("img", { src: src, alt: `${name} avatar`, className: clsx("rounded-full object-cover"), style: { width: size, height: size } })) : (_jsx("div", { "aria-label": `${name} avatar`, className: "rounded-full bg-[var(--color-primary)] text-black font-semibold flex items-center justify-center", style: { width: size, height: size }, children: initials || "A" }));
}
