
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/data";
import { UserRole, User } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = ["admin", "volunteer"] 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!currentUser) {
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
    };
    
    checkAuth();
  }, [currentUser]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !requiredRole.includes(currentUser.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
