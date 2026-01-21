import { Link, LinkProps } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BubblyLinkProps extends LinkProps {
  children: React.ReactNode;
  variant?: "default" | "subtle" | "chaotic";
  className?: string;
}

export function BubblyLink({ 
  children, 
  variant = "default", 
  className,
  ...props 
}: BubblyLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 400);
  };

  const variantStyles = {
    default: "text-accent hover:text-accent-hover underline underline-offset-4 decoration-wavy decoration-accent/50",
    subtle: "text-muted-foreground hover:text-foreground transition-colors",
    chaotic: "text-accent font-display font-bold hover:text-accent-hover",
  };

  return (
    <Link
      {...props}
      className={cn(
        "inline-block transition-all duration-200",
        variantStyles[variant],
        isHovered && "animate-wiggle",
        isClicked && "animate-squish",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
