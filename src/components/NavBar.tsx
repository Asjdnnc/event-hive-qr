
import { Button } from "@/components/ui/button";
import { setCurrentUser } from "@/lib/data";
import { useNavigate, Link } from "react-router-dom";

interface NavBarProps {
  userRole: string;
}

const NavBar: React.FC<NavBarProps> = ({ userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">EventHive QR</h1>
        </div>
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
      </div>
    </nav>
  );
};

export default NavBar;
