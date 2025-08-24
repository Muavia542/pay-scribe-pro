import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Building, Calculator, FileText, BarChart3, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Departments", href: "/departments", icon: Building },
  { name: "Payroll", href: "/payroll", icon: Calculator },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Import Data", href: "/import", icon: Upload },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card shadow-medium border-r border-border">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-primary">PayScribe Pro</h1>
            <p className="text-sm text-muted-foreground mt-1">Employee Management</p>
          </div>
          
          <nav className="px-4 pb-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;