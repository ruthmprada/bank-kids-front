type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  type = "text",
  className = "",
  ...props
}: Props) {
  return (
    <input
      type={type}
      {...props}
      className={`w-full p-3 rounded-xl bg-white/85 border border-surface-container-high text-on-surface placeholder:text-on-surface-variant/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
    />
  );
}
