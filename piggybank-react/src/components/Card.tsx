type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-surface-container-highest rounded-xl p-4 shadow-sm border border-surface-container ${className}`}
    >
      {children}
    </div>
  );
}
