interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  return (
    <span className={`badge badge-${normalizedStatus}`}>
      <span className="badge-dot" />
      {status.replace('_', ' ')}
    </span>
  );
}
