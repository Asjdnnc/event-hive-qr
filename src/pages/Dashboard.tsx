
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { getCurrentUser, getAllTeams } from "@/lib/data";
import { Team } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import TeamCard from "@/components/TeamCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lunchValid: 0,
    dinnerValid: 0,
    snacksValid: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchTeams = async () => {
      setLoading(true);
      try {
        // Fetch teams from Supabase
        const allTeams = await getAllTeams();
        setTeams(allTeams);

        // Calculate stats
        const active = allTeams.filter(team => team.status === "active").length;
        const lunchValid = allTeams.filter(team => team.foodStatus.lunch === "valid").length;
        const dinnerValid = allTeams.filter(team => team.foodStatus.dinner === "valid").length;
        const snacksValid = allTeams.filter(team => team.foodStatus.snacks === "valid").length;

        setStats({
          total: allTeams.length,
          active,
          inactive: allTeams.length - active,
          lunchValid,
          dinnerValid,
          snacksValid,
        });
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [navigate, toast, user]);

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.leader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userRole={user?.role || ""} />

      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Teams</CardTitle>
              <CardDescription>All registered teams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Teams</CardTitle>
              <CardDescription>Teams with active status</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
              <p className="text-3xl font-bold">{stats.active}</p>
              <p className="text-3xl font-bold text-muted-foreground">{stats.inactive}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Food Status</CardTitle>
              <CardDescription>Teams with valid meals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>Lunch: {stats.lunchValid}</span>
                <span>Dinner: {stats.dinnerValid}</span>
                <span>Snacks: {stats.snacksValid}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teams by name or leader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          {searchQuery ? "Search Results" : "Recent Teams"}
        </h2>
        
        {loading ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Loading teams...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(searchQuery ? filteredTeams : teams.slice(0, 4)).map((team) => (
              <TeamCard key={team.id} team={team} isAdmin={user?.role === "admin"} />
            ))}
          </div>
        )}
        
        {filteredTeams.length === 0 && searchQuery && !loading && (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">No teams match your search</h3>
            <p className="text-muted-foreground mt-2">
              Try using different keywords or check your spelling
            </p>
          </div>
        )}
        
        {teams.length === 0 && !searchQuery && !loading && (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">No teams registered yet</h3>
            {user?.role === "admin" && (
              <p className="text-muted-foreground mt-2">
                Start by registering a team from the "Register Team" page
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
