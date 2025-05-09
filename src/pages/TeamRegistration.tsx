
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addTeam, getCurrentUser } from "@/lib/data";
import { Team, TeamMember } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import QRCodeComponent from "@/components/QRCode";
import BulkTeamRegistration from "@/components/BulkTeamRegistration";

const TeamRegistration = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [name, setName] = useState("");
  const [leader, setLeader] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { name: "", collegeName: "" },
  ]);
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!user) {
    navigate("/");
    return null;
  }

  const handleAddMember = () => {
    setMembers([...members, { name: "", collegeName: "" }]);
  };

  const handleRemoveMember = (index: number) => {
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !leader || members.some(m => !m.name || !m.collegeName)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newTeam: Omit<Team, "id" | "createdAt"> = {
      name,
      leader,
      members,
      status: "inactive", // Default to inactive
      foodStatus: {
        lunch: "invalid",
        dinner: "invalid",
        snacks: "invalid",
      },
    };

    try {
      const registeredTeam = addTeam(newTeam);
      setRegisteredTeam(registeredTeam);
      
      toast({
        title: "Team Registered",
        description: "The team has been successfully registered.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An error occurred during team registration.",
        variant: "destructive",
      });
    }
  };

  const handleRegisterAnother = () => {
    setName("");
    setLeader("");
    setMembers([{ name: "", collegeName: "" }]);
    setRegisteredTeam(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userRole={user.role} />

      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Team Registration</h1>

        {registeredTeam ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Successful</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Team Name:</p>
                  <p>{registeredTeam.name}</p>
                </div>
                <div>
                  <p className="font-medium">Team Leader:</p>
                  <p>{registeredTeam.leader}</p>
                </div>
                <div>
                  <p className="font-medium">Team ID:</p>
                  <p>{registeredTeam.id}</p>
                </div>
                <div>
                  <p className="font-medium">Status:</p>
                  <p>{registeredTeam.status}</p>
                </div>
                <Button onClick={handleRegisterAnother} className="w-full">
                  Register Another Team
                </Button>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-semibold mb-4">Team QR Code</h2>
              <QRCodeComponent team={registeredTeam} />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="single">Single Registration</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Registration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle>Register a New Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium">
                          Team Name
                        </label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter team name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="leader" className="text-sm font-medium">
                          Team Leader
                        </label>
                        <Input
                          id="leader"
                          value={leader}
                          onChange={(e) => setLeader(e.target.value)}
                          placeholder="Enter team leader name"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Team Members</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddMember}
                          >
                            Add Member
                          </Button>
                        </div>

                        {members.map((member, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <Input
                              value={member.name}
                              onChange={(e) =>
                                handleMemberChange(index, "name", e.target.value)
                              }
                              placeholder="Member Name"
                              required
                            />
                            <div className="flex space-x-2">
                              <Input
                                value={member.collegeName}
                                onChange={(e) =>
                                  handleMemberChange(index, "collegeName", e.target.value)
                                }
                                placeholder="College Name"
                                required
                              />
                              {members.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(index)}
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

                    <Button type="submit" className="w-full">
                      Register Team
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bulk">
              <BulkTeamRegistration />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default TeamRegistration;
