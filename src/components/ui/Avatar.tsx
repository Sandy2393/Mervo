import clsx from "clsx";

type Props = {
  name: string;
  size?: number;
  src?: string;
};

export default function Avatar({ name, size = 32, src }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={`${name} avatar`}
      className={clsx("rounded-full object-cover")}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      aria-label={`${name} avatar`}
      className="rounded-full bg-[var(--color-primary)] text-black font-semibold flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {initials || "A"}
    </div>
  );
}
