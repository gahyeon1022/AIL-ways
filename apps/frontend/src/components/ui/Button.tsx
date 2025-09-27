import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "px-4 py-2 rounded-md transition-colors",
        variant === "default" && "bg-black text-white hover:bg-black/80",
        variant === "ghost" && "bg-transparent text-black hover:bg-black/10",
        className="text-black hover:bg-black/10 hover:text-black text-sm px-4 py-2 transition-colors"
      )}
    />
  );
}
