import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-md px-4 py-2 text-sm transition-colors",
        variant === "default" ? "bg-black text-white hover:bg-black/80" : null,
        variant === "ghost" ? "bg-transparent text-black hover:bg-black/10" : null,
        className
      )}
    />
  );
}
