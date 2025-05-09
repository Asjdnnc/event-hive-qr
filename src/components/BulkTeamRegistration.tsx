
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { addBulkTeams } from "@/lib/data";
import { Team, TeamMember } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

const BulkTeamRegistration = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    const teams: Omit<Team, "id" | "createdAt">[] = [];
    let currentTeam: Omit<Team, "id" | "createdAt"> | null = null;
    let headers: string[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return; // Skip empty lines
      
      const values = line.split(",").map(val => val.trim());
      
      if (index === 0) {
        // Assume first line is header
        headers = values;
        return;
      }

      // Create a row object from headers and values
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        if (i < values.length) {
          row[header.toLowerCase()] = values[i];
        }
      });
      
      // Check if this is a new team
      if (row.teamname || row['team name'] || row.name) {
        // Save previous team if exists
        if (currentTeam) {
          teams.push(currentTeam);
        }
        
        // Create new team
        currentTeam = {
          name: row.teamname || row['team name'] || row.name,
          leader: row.leader || row.teamleader || row['team leader'] || '',
          members: [],
          status: "inactive",
          foodStatus: {
            lunch: "invalid",
            dinner: "invalid",
            snacks: "invalid",
          }
        };
      }

      // Add member if we have member data
      if (currentTeam && row.membername || row['member name'] || row.member) {
        currentTeam.members.push({
          name: row.membername || row['member name'] || row.member,
          collegeName: row.college || row.collegename || row['college name'] || ''
        });
      }
    });

    // Add the last team if it exists
    if (currentTeam) {
      teams.push(currentTeam);
    }

    return teams;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      const teamsData = parseCSV(text);
      
      if (teamsData.length === 0) {
        throw new Error("No valid team data found in the CSV file");
      }

      const registeredTeams = addBulkTeams(teamsData);
      
      toast({
        title: "Teams Registered Successfully",
        description: `${registeredTeams.length} teams have been registered`,
      });
      
      setFile(null);
    } catch (error) {
      toast({
        title: "Error Processing CSV",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Team Registration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a CSV file with team details. The CSV should include columns for team name, 
          team leader, member name, and college name.
        </p>
        
        <Alert>
          <AlertTitle>CSV Format Instructions</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Your CSV file should follow this format:</p>
            <pre className="mt-2 mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-md overflow-x-auto text-xs">
              TeamName,Leader,MemberName,College<br/>
              Team1,John Doe,Member1,College A<br/>
              Team1,,Member2,College B<br/>
              Team2,Jane Smith,Member1,College C<br/>
              Team2,,Member2,College D
            </pre>
            <p className="text-sm">
              <strong>Notes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The first row must be the header row.</li>
                <li>Each team should have at least one row with the team name and leader.</li>
                <li>Additional members can be added in subsequent rows, leaving the TeamName and Leader fields empty.</li>
                <li>Accepted column names (case-insensitive):
                  <ul className="list-disc list-inside ml-4">
                    <li>Team: "TeamName", "Team Name", "Name"</li>
                    <li>Leader: "Leader", "TeamLeader", "Team Leader"</li>
                    <li>Member: "MemberName", "Member Name", "Member"</li>
                    <li>College: "College", "CollegeName", "College Name"</li>
                  </ul>
                </li>
              </ul>
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name}
            </p>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload and Register Teams"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkTeamRegistration;
