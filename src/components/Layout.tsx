import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Building, Calculator, FileText, BarChart3, Upload, Receipt, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Departments", href: "/departments", icon: Building },
  { name: "Payroll", href: "/payroll", icon: Calculator },
  { name: "Generate Invoice", href: "/kpk-invoice", icon: Receipt },
  { name: "Dynamic Invoice", href: "/dynamic-invoice", icon: FileText },
  { name: "Saved Invoices", href: "/saved-invoices", icon: FileText },
  { name: "Import Data", href: "/import", icon: Upload },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const NavigationContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Tahira Construction</h1>
        <p className="text-sm text-muted-foreground mt-1">Construction Services</p>
      </div>
      
      <nav className="px-4 pb-4 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
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
      
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      {/* Header with Hamburger */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">Tahira Construction</h1>
        </div>
      </div>

      <div className="flex flex-1 pt-16">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-card shadow-xl border-r border-border z-50">
              <NavigationContent />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-8">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-card border-t border-border mt-auto">
            <div className="px-8 py-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">TAHIRA CONSTRUCTION & SERVICES</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Address:</strong> VPO Makori Tehsil Banda Daud Shah District Karak</p>
                  <p><strong>Email:</strong> mshamidkhattak@gmail.com</p>
                  <p><strong>Contact No:</strong> 03155157591</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;