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
  { name: "Invoice Management", href: "/invoices", icon: FileText },
  { name: "Generate Invoice", href: "/kpk-invoice", icon: Receipt },
  { name: "Saved Invoices", href: "/saved-invoices", icon: FileText },
  { name: "Import Data", href: "/import", icon: Upload },
];

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const NavigationContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">PayScribe Pro</h1>
        <p className="text-sm text-muted-foreground mt-1">Employee Management</p>
      </div>
      
      <nav className="px-4 pb-4 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => isMobile && setMobileMenuOpen(false)}
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
      <div className="flex flex-1">
        {/* Mobile Header */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">PayScribe Pro</h1>
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 bg-card shadow-medium border-r border-border">
            <NavigationContent />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed top-0 left-0 w-64 h-full bg-card shadow-xl border-r border-border z-50 pt-16">
              <NavigationContent />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className={cn("p-8", isMobile && "pt-20")}>
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