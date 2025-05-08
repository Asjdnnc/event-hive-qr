
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

const QRScanner = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [scanning, setScanning] = useState(false);
  const [scannedTeam, setScannedTeam] = useState<Team | null>(null);
  const [teamNotFound, setTeamNotFound] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<"lunch" | "dinner" | "snacks">("lunch");
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
                  <Button onClick={() => setScanning(true)} className="w-full">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal">
            <Card>
              <CardHeader>
                <CardTitle>Update Meal Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scannedTeam ? (
                  <div className="space-y-6">
                    <TeamCard team={scannedTeam} isAdmin={false} />

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Select Meal</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <Button 
                            variant={selectedMeal === "lunch" ? "default" : "outline"}
                            onClick={() => setSelectedMeal("lunch")} 
                            className="w-full"
                          >
                            Lunch
                          </Button>
                          <Button 
                            variant={selectedMeal === "dinner" ? "default" : "outline"}
                            onClick={() => setSelectedMeal("dinner")} 
                            className="w-full"
                          >
                            Dinner
                          </Button>
                          <Button 
                            variant={selectedMeal === "snacks" ? "default" : "outline"}
                            onClick={() => setSelectedMeal("snacks")} 
                            className="w-full"
                          >
                            Snacks
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Update Status</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <Button
                            variant="outline"
                            className="border-green-500 hover:bg-green-50"
                            onClick={() => handleUpdateFoodStatus("valid")}
                          >
                            Mark as Valid
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-500 hover:bg-red-50"
                            onClick={() => handleUpdateFoodStatus("invalid")}
                          >
                            Mark as Invalid
                          </Button>
                        </div>
                      </div>

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
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No team has been scanned yet. Please scan a team QR code first.
                    </p>
                    <Button 
                      onClick={() => {
                        setScanning(true);
                        document.querySelector('[data-value="scan"]')?.dispatchEvent(
                          new MouseEvent('click', { bubbles: true })
                        );
                      }}
                      className="mt-4"
                    >
                      Go to Scanner
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
            <DialogDescription>Position the QR code within the scanner area.</DialogDescription>
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
