type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
}: Props) {
  const base =
    "rounded-xl font-semibold transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
  };

  const variants = {
    primary:
      "bg-primary text-white shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
    secondary:
      "bg-white/80 text-primary border border-primary/20 hover:bg-primary/5",
    ghost:
      "text-primary hover:bg-primary/10",
    danger:
      "bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]",
  };

  const disabledStyle = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        disabled ? disabledStyle : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
