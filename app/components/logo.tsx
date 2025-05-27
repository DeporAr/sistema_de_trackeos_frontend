interface LogoProps {
  variant?: "default" | "white" | "orange";
  className?: string;
}

export function Logo({ variant = "default", className = "" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="font-bold text-xl">
        <span>Depor</span>
        <span className="text-orange-500">Ar</span>
      </div>
    </div>
  );
}

export function LogoIcon({ variant = "default", className = "" }: LogoProps) {
  const bgColor =
    variant === "white"
      ? "bg-white"
      : variant === "orange"
        ? "bg-primary"
        : "bg-black";
  const textColor = variant === "default" ? "text-white" : "text-primary";

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${bgColor} rounded-md p-1 font-akira text-lg`}>
        <span className={textColor}>D</span>
        <span className={variant === "default" ? "text-primary" : "text-white"}>
          A
        </span>
      </div>
    </div>
  );
}
