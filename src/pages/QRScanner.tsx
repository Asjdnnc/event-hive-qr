
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getCurrentUser, updateTeamFoodStatus, getTeam } from "@/lib/data";
import { Team } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import TeamCard from "@/components/TeamCard";
import { QrReader } from "react-qr-reader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const QRScanner = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [scanning, setScanning] = useState(false);
  const [scannedTeam, setScannedTeam] = useState<Team | null>(null);
  const [teamNotFound, setTeamNotFound] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<"lunch" | "dinner" | "snacks">("lunch");
  const [scanPurpose, setScanPurpose] = useState<"registration" | "meal">("registration");
  const [mealAction, setMealAction] = useState<"valid" | "invalid">("valid");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    if (user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can access the QR scanner.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  const handleScan = (result: any) => {
    if (result?.text) {
      try {
        console.log("QR Scan result:", result.text);
        const scannedData = JSON.parse(result.text);
        
        // Validate QR data
        if (scannedData?.id) {
          const team = getTeam(scannedData.id);
          if (team) {
            setScannedTeam(team);
            setTeamNotFound(false);
            setScanning(false);
            
            toast({
              title: "QR Code Scanned",
              description: `Team: ${team.name}`,
            });
            
            // If scanning for meal purposes, automatically update meal status
            if (scanPurpose === "meal") {
              const updatedTeam = updateTeamFoodStatus(team.id, selectedMeal, mealAction);
              
              if (updatedTeam) {
                setScannedTeam(updatedTeam);
                toast({
                  title: "Status Updated Automatically",
                  description: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} status updated to ${mealAction}.`,
                });
              }
            }
          } else {
            setTeamNotFound(true);
            setScannedTeam(null);
            
            toast({
              title: "Team Not Found",
              description: "The scanned QR code doesn't match any registered team.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("QR Scan error:", error);
        toast({
          title: "Invalid QR Code",
          description: "The scanned QR code is not valid.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateFoodStatus = (status: "valid" | "invalid") => {
    if (scannedTeam) {
      const updatedTeam = updateTeamFoodStatus(scannedTeam.id, selectedMeal, status);
      
      if (updatedTeam) {
        setScannedTeam(updatedTeam);
        toast({
          title: "Status Updated",
          description: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} status updated to ${status}.`,
        });
      }
    }
  };

  const startScanning = (purpose: "registration" | "meal") => {
    setScanPurpose(purpose);
    setScanning(true);
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userRole={user.role} />

      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-2xl font-bold mb-6">QR Scanner</h1>

        <Tabs defaultValue="scan" className="max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
            <TabsTrigger value="meal">Update Meal Status</TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle>Scan Team QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scanning ? (
                  <div className="relative border rounded-md overflow-hidden aspect-square max-w-sm mx-auto">
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      onResult={handleScan}
                      className="w-full h-full"
                      scanDelay={500}
                    />
                  </div>
                ) : (
                  <Button onClick={() => startScanning("registration")} className="w-full">
                    Start Scanning
                  </Button>
                )}

                {teamNotFound && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                    <p className="text-red-700">Team not found. Please try scanning again.</p>
                  </div>
                )}

                {scanning && (
                  <Button variant="outline" onClick={() => setScanning(false)} className="w-full">
                    Cancel Scanning
                  </Button>
                )}

                {scannedTeam && scanPurpose === "registration" && (
                  <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-md">
                    <h3 className="font-medium text-green-800 mb-2">Team Registered Successfully</h3>
                    <p className="text-sm">Team Name: {scannedTeam.name}</p>
                    <p className="text-sm">Leader: {scannedTeam.leader}</p>
                    <p className="text-sm">Members: {scannedTeam.members.length}</p>
                    <Button className="mt-4 w-full" onClick={() => setScannedTeam(null)}>
                      Scan Another Team
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal">
            <Card>
              <CardHeader>
                <CardTitle>Update Meal Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!scanning && !scannedTeam ? (
                  <div className="space-y-6">
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-medium mb-4">Configure Meal Status Update</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Meal</label>
                          <Select
                            value={selectedMeal}
                            onValueChange={(value: "lunch" | "dinner" | "snacks") => setSelectedMeal(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a meal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                              <SelectItem value="snacks">Snacks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Mark Status As</label>
                          <RadioGroup 
                            value={mealAction} 
                            onValueChange={(value: "valid" | "invalid") => setMealAction(value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="valid" id="valid" />
                              <label htmlFor="valid">Valid</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="invalid" id="invalid" />
                              <label htmlFor="invalid">Invalid</label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <Button 
                          onClick={() => startScanning("meal")} 
                          className="w-full mt-2"
                        >
                          Start Scanning QR Codes
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : scannedTeam ? (
                  <div className="space-y-6">
                    <TeamCard team={scannedTeam} isAdmin={false} />

                    <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                      <h3 className="font-medium text-green-800 mb-2">Status Updated Successfully</h3>
                      <p className="text-sm">
                        {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} status for {scannedTeam.name} has been marked as {mealAction}.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setScannedTeam(null);
                          setScanning(true);
                        }}
                        className="w-full"
                      >
                        Scan Another Team
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScannedTeam(null);
                          setScanning(false);
                        }}
                        className="w-full"
                      >
                        Configure Different Meal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Scanning QR codes for {selectedMeal} with status: {mealAction}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setScanning(false)}
                      className="mt-4"
                    >
                      Cancel and Configure
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={scanning} onOpenChange={setScanning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              {scanPurpose === "registration" 
                ? "Scan a team's QR code to register their attendance."
                : `Scanning to mark ${selectedMeal} as ${mealAction} for teams.`}
            </DialogDescription>
          </DialogHeader>
          <div className="relative border rounded-md overflow-hidden aspect-square">
            <QrReader
              constraints={{ facingMode: "environment" }}
              onResult={handleScan}
              className="w-full h-full"
              scanDelay={500}
            />
          </div>
          <Button variant="outline" onClick={() => setScanning(false)}>
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QRScanner;
