import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  variant?: "default" | "success" | "warning";
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  variant = "default",
  className 
}: StatCardProps) => {
  const variants = {
    default: "bg-card border-border",
    success: "bg-gradient-to-br from-success/5 to-success/10 border-success/20",
    warning: "bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20"
  };

  return (
    <Card className={cn(
      "shadow-soft hover:shadow-medium transition-all duration-200",
      variants[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            variant === "success" && "bg-success/10 text-success",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "default" && "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;