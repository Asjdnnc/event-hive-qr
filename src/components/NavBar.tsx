
import { Button } from "@/components/ui/button";
import { setCurrentUser } from "@/lib/data";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavBarProps {
  userRole: string;
}

const NavBar: React.FC<NavBarProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Hackzilla</h1>
        </div>
        
        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1" 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            
            {menuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-primary text-primary-foreground p-4 z-50 flex flex-col gap-3">
                <Link 
                  to="/dashboard" 
                  className="block py-2 px-4 hover:bg-primary/90 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {userRole === "admin" && (
                  <>
                    <Link 
                      to="/team-registration" 
                      className="block py-2 px-4 hover:bg-primary/90 rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      Register Team
                    </Link>
                    <Link 
                      to="/team-management" 
                      className="block py-2 px-4 hover:bg-primary/90 rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      Teams
                    </Link>
                    <Link 
                      to="/qr-scanner" 
                      className="block py-2 px-4 hover:bg-primary/90 rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      Scan QR
                    </Link>
                    <Link 
                      to="/admin-management" 
                      className="block py-2 px-4 hover:bg-primary/90 rounded-md"
                      onClick={() => setMenuOpen(false)}
                    >
                      Users
                    </Link>
                  </>
                )}
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            {userRole === "admin" && (
              <>
                <Link to="/team-registration" className="hover:underline">
                  Register Team
                </Link>
                <Link to="/team-management" className="hover:underline">
                  Teams
                </Link>
                <Link to="/qr-scanner" className="hover:underline">
                  Scan QR
                </Link>
                <Link to="/admin-management" className="hover:underline">
                  Users
                </Link>
              </>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
