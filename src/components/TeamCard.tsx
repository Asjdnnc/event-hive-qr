
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import QRCodeComponent from "./QRCode";
import { updateTeamFoodStatus } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";

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
            <div className="text-center">
              <p className="text-xs font-medium">Lunch</p>
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="outline" className={`status-${team.foodStatus.lunch} cursor-pointer`}>
                      {team.foodStatus.lunch}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleUpdateFoodStatus("lunch", "valid")}>
                      Mark as Valid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateFoodStatus("lunch", "invalid")}>
                      Mark as Invalid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className={`status-${team.foodStatus.lunch}`}>
                  {team.foodStatus.lunch}
                </Badge>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-medium">Dinner</p>
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="outline" className={`status-${team.foodStatus.dinner} cursor-pointer`}>
                      {team.foodStatus.dinner}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleUpdateFoodStatus("dinner", "valid")}>
                      Mark as Valid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateFoodStatus("dinner", "invalid")}>
                      Mark as Invalid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className={`status-${team.foodStatus.dinner}`}>
                  {team.foodStatus.dinner}
                </Badge>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-medium">Snacks</p>
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="outline" className={`status-${team.foodStatus.snacks} cursor-pointer`}>
                      {team.foodStatus.snacks}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleUpdateFoodStatus("snacks", "valid")}>
                      Mark as Valid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateFoodStatus("snacks", "invalid")}>
                      Mark as Invalid
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className={`status-${team.foodStatus.snacks}`}>
                  {team.foodStatus.snacks}
                </Badge>
              )}
            </div>
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
