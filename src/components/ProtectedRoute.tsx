
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/data";
import { UserRole } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = ["admin", "volunteer"] 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated with Supabase
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        setIsAuthenticated(false);
        return;
      }
      
      // If we have a session but no current user in localStorage,
      // fetch the user data from the database
      if (!currentUser && data.session) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (userData && !error) {
            // Make sure the role is properly cast to UserRole
            const validatedUser = {
              ...userData,
              role: userData.role as UserRole
            };
            localStorage.setItem("currentUser", JSON.stringify(validatedUser));
            setCurrentUser(validatedUser);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(Boolean(currentUser));
      }
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
