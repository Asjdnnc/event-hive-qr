
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { getCurrentUser, getAllTeams, updateTeam, deleteTeam } from "@/lib/data";
import { Team, TeamMember } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import TeamCard from "@/components/TeamCard";

const TeamManagement = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editLeader, setEditLeader] = useState("");
  const [editMembers, setEditMembers] = useState<TeamMember[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetchTeams();
  }, [user, navigate]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const allTeams = await getAllTeams();
      setTeams(allTeams);
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

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditLeader(team.leader);
    setEditMembers([...team.members]);
    setIsEditDialogOpen(true);
  };

  const handleEditMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...editMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setEditMembers(newMembers);
  };

  const handleAddEditMember = () => {
    setEditMembers([...editMembers, { name: "", collegeName: "" }]);
  };

  const handleRemoveEditMember = (index: number) => {
    const newMembers = [...editMembers];
    newMembers.splice(index, 1);
    setEditMembers(newMembers);
  };

  const handleSaveEdit = async () => {
    if (!editingTeam) return;

    if (!editName || !editLeader || editMembers.some(m => !m.name || !m.collegeName)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTeam = await updateTeam(editingTeam.id, {
        name: editName,
        leader: editLeader,
        members: editMembers,
      });

      if (updatedTeam) {
        await fetchTeams();
        setIsEditDialogOpen(false);
        toast({
          title: "Team Updated",
          description: "Team details have been updated successfully.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update team details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the team.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const deleted = await deleteTeam(id);
        if (deleted) {
          await fetchTeams();
          toast({
            title: "Team Deleted",
            description: "The team has been deleted successfully.",
          });
        } else {
          toast({
            title: "Delete Failed",
            description: "Failed to delete the team.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting team:", error);
        toast({
          title: "Delete Failed",
          description: "An error occurred while deleting the team.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: "active" | "inactive") => {
    try {
      const updatedTeam = await updateTeam(id, { status });
      if (updatedTeam) {
        await fetchTeams();
        toast({
          title: "Status Updated",
          description: `Team status updated to ${status}.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update team status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating team status:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the team status.",
        variant: "destructive",
      });
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userRole={user.role} />

      <div className="container mx-auto p-4 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">Team Management</h1>
          <Button onClick={() => navigate("/team-registration")}>Register New Team</Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search teams by name, leader or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Loading teams...</p>
            </CardContent>
          </Card>
        ) : filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "No teams found matching your search."
                  : "No teams registered yet. Click 'Register New Team' to add a team."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Leader</label>
              <Input
                value={editLeader}
                onChange={(e) => setEditLeader(e.target.value)}
                placeholder="Enter team leader name"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Team Members</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEditMember}
                >
                  Add Member
                </Button>
              </div>

              {editMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <Input
                    value={member.name}
                    onChange={(e) =>
                      handleEditMemberChange(index, "name", e.target.value)
                    }
                    placeholder="Member Name"
                  />
                  <div className="flex space-x-2">
                    <Input
                      value={member.collegeName}
                      onChange={(e) =>
                        handleEditMemberChange(index, "collegeName", e.target.value)
                      }
                      placeholder="College Name"
                    />
                    {editMembers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEditMember(index)}
                        className="shrink-0"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
