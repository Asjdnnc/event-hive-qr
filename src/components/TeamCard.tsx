
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import QRCodeComponent from "./QRCode";
import { updateTeamFoodStatus } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import { Check, X } from "lucide-react";

interface TeamCardProps {
  team: Team;
  onDelete?: (id: string) => void;
  onEdit?: (team: Team) => void;
  onUpdateStatus?: (id: string, status: "active" | "inactive") => void;
  isAdmin?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  onDelete, 
  onEdit, 
  onUpdateStatus,
  isAdmin = true
}) => {
  const { toast } = useToast();
  
  const handleUpdateFoodStatus = (meal: "lunch" | "dinner" | "snacks", status: "valid" | "invalid") => {
    const updatedTeam = updateTeamFoodStatus(team.id, meal, status);
    if (updatedTeam) {
      toast({
        title: "Food Status Updated",
        description: `${meal.charAt(0).toUpperCase() + meal.slice(1)} status updated to ${status}.`,
      });
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{team.name}</CardTitle>
          <p className="text-sm text-muted-foreground">ID: {team.id.slice(0, 8)}</p>
        </div>
        <Badge className={`status-${team.status}`}>{team.status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Team Leader</p>
            <p>{team.leader}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Team Members</p>
            <ul className="list-disc list-inside space-y-1">
              {team.members.map((member, index) => (
                <li key={index} className="text-sm">
                  {member.name} - {member.collegeName}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2">
            {isAdmin ? (
              <>
                <div className="text-center">
                  <p className="text-xs font-medium">Lunch</p>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="outline" className={`status-${team.foodStatus.lunch}`}>
                      {team.foodStatus.lunch}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant={team.foodStatus.lunch === "valid" ? "default" : "outline"} 
                        className="h-7 w-7 p-0" 
                        onClick={() => handleUpdateFoodStatus("lunch", "valid")}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={team.foodStatus.lunch === "invalid" ? "destructive" : "outline"} 
                        className="h-7 w-7 p-0" 
                        onClick={() => handleUpdateFoodStatus("lunch", "invalid")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-medium">Dinner</p>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="outline" className={`status-${team.foodStatus.dinner}`}>
                      {team.foodStatus.dinner}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant={team.foodStatus.dinner === "valid" ? "default" : "outline"} 
                        className="h-7 w-7 p-0" 
                        onClick={() => handleUpdateFoodStatus("dinner", "valid")}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={team.foodStatus.dinner === "invalid" ? "destructive" : "outline"} 
                        className="h-7 w-7 p-0" 
                        onClick={() => handleUpdateFoodStatus("dinner", "invalid")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-medium">Snacks</p>
                  <div className="flex flex-col items-center space-y-1">
                    <Badge variant="outline" className={`status-${team.foodStatus.snacks}`}>
                      {team.foodStatus.snacks}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant={team.foodStatus.snacks === "valid" ? "default" : "outline"} 
                        className="h-7 w-7 p-0" 
                        onClick={() => handleUpdateFoodStatus("snacks", "valid")}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={team.foodStatus.snacks === "invalid" ? "destructive" : "outline"} 
                        className="h-7 w-7 p-0" 
                        onClick={() => handleUpdateFoodStatus("snacks", "invalid")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-xs font-medium">Lunch</p>
                  <Badge variant="outline" className={`status-${team.foodStatus.lunch}`}>
                    {team.foodStatus.lunch}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">Dinner</p>
                  <Badge variant="outline" className={`status-${team.foodStatus.dinner}`}>
                    {team.foodStatus.dinner}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">Snacks</p>
                  <Badge variant="outline" className={`status-${team.foodStatus.snacks}`}>
                    {team.foodStatus.snacks}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      {isAdmin && (
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">View QR</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Team QR Code</DialogTitle>
              </DialogHeader>
              <QRCodeComponent team={team} />
            </DialogContent>
          </Dialog>
          
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(team)}>
              Edit
            </Button>
          )}
          
          {onUpdateStatus && (
            <Button
              variant={team.status === "active" ? "destructive" : "default"}
              onClick={() => 
                onUpdateStatus(
                  team.id, 
                  team.status === "active" ? "inactive" : "active"
                )
              }
            >
              {team.status === "active" ? "Deactivate" : "Activate"}
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="destructive"
              onClick={() => onDelete(team.id)}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default TeamCard;
