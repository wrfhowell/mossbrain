interface Props {
  className?: string;
  float?: boolean;
  floatSpeed?: string;
  size?: number;
}

export default function Logo({ className = "", float: doFloat = false, floatSpeed = "2.4s", size = 48 }: Props) {
  return (
    <img
      src="/logo.png"
      alt="mossbrain"
      width={size}
      height={Math.round(size * (161 / 242))}
      style={doFloat ? { animation: `float ${floatSpeed} ease-in-out infinite` } : undefined}
      className={className}
    />
  );
}
