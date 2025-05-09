
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser, updateTeamFoodStatus, getTeam } from "@/lib/data";
import { Team } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import NavBar from "@/components/NavBar";
import TeamCard from "@/components/TeamCard";
import { QrReader } from "react-qr-reader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QrCode, Utensils, Cake, Sandwich } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const QRScanner = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [scanning, setScanning] = useState(false);
  const [scannedTeam, setScannedTeam] = useState<Team | null>(null);
  const [teamNotFound, setTeamNotFound] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<"lunch" | "dinner" | "snacks">("lunch");
  const [scanPurpose, setScanPurpose] = useState<"entry" | "lunch" | "dinner" | "snacks">("entry");
  const [mealAction, setMealAction] = useState<"valid" | "invalid">("valid");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isAdmin = user?.role === "admin";

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
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
            if (scanPurpose === "lunch" || scanPurpose === "dinner" || scanPurpose === "snacks") {
              // Volunteers can only mark as valid
              const status = user?.role === "volunteer" ? "valid" : mealAction;
              const updatedTeam = updateTeamFoodStatus(team.id, scanPurpose, status);
              
              if (updatedTeam) {
                setScannedTeam(updatedTeam);
                toast({
                  title: "Status Updated Automatically",
                  description: `${scanPurpose.charAt(0).toUpperCase() + scanPurpose.slice(1)} status updated to ${status}.`,
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

  const startScanning = (purpose: "entry" | "lunch" | "dinner" | "snacks") => {
    setScanPurpose(purpose);
    setScanning(true);
  };

  const getScanPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case "entry":
        return <QrCode className="h-4 w-4" />;
      case "lunch":
        return <Utensils className="h-4 w-4" />;
      case "dinner":
        return <Cake className="h-4 w-4" />;
      case "snacks":
        return <Sandwich className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getScanPurposeTitle = (purpose: string) => {
    switch (purpose) {
      case "entry":
        return "Entry Registration";
      case "lunch":
        return "Lunch Check-in";
      case "dinner":
        return "Dinner Check-in";
      case "snacks":
        return "Snacks Check-in";
      default:
        return "Scan QR Code";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar userRole={user.role} />

      <div className="container mx-auto p-4 flex-grow">
        <h1 className="text-2xl font-bold mb-6">QR Scanner</h1>
        
        {user.role === "volunteer" && (
          <div className="bg-yellow-100 p-4 rounded-lg mb-6 shadow-sm">
            <p className="text-yellow-800">
              <strong>Volunteer Mode:</strong> You can scan team QR codes to mark meals as valid.
            </p>
          </div>
        )}

        <Tabs defaultValue="entry" className="max-w-3xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="entry" className="flex items-center justify-center gap-1">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Entry</span>
            </TabsTrigger>
            <TabsTrigger value="lunch" className="flex items-center justify-center gap-1">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Lunch</span>
            </TabsTrigger>
            <TabsTrigger value="dinner" className="flex items-center justify-center gap-1">
              <Cake className="h-4 w-4" />
              <span className="hidden sm:inline">Dinner</span>
            </TabsTrigger>
            <TabsTrigger value="snacks" className="flex items-center justify-center gap-1">
              <Sandwich className="h-4 w-4" />
              <span className="hidden sm:inline">Snacks</span>
            </TabsTrigger>
          </TabsList>

          {["entry", "lunch", "dinner", "snacks"].map((purpose) => (
            <TabsContent key={purpose} value={purpose}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getScanPurposeIcon(purpose)}
                    {getScanPurposeTitle(purpose)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanning ? (
                    <div className="relative border rounded-md overflow-hidden aspect-square max-w-sm mx-auto">
                      <QrReader
                        constraints={{ facingMode: "environment" }}
                        onResult={handleScan}
                        className="w-full h-full"
                        scanDelay={500}
                        ViewFinder={() => <div className="border-2 border-primary w-1/2 h-1/2 absolute top-1/4 left-1/4 z-10 rounded-lg" />}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setScanning(false)} 
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      {purpose !== "entry" && isAdmin && (
                        <div className="p-4 border rounded-md mb-4">
                          <h3 className="text-lg font-medium mb-4">Configure Status Update</h3>
                          <div className="space-y-4">
                            <RadioGroup 
                              value={mealAction} 
                              onValueChange={(value: "valid" | "invalid") => setMealAction(value)}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="valid" id={`valid-${purpose}`} />
                                <label htmlFor={`valid-${purpose}`}>Valid</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="invalid" id={`invalid-${purpose}`} />
                                <label htmlFor={`invalid-${purpose}`}>Invalid</label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      )}
                      
                      {purpose !== "entry" && !isAdmin && (
                        <div className="p-4 border border-green-100 bg-green-50 rounded-md mb-4">
                          <p className="text-green-800">
                            As a volunteer, scanning a QR code will automatically mark {purpose} as valid.
                          </p>
                        </div>
                      )}
                    
                      <Button 
                        onClick={() => startScanning(purpose as "entry" | "lunch" | "dinner" | "snacks")} 
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {getScanPurposeIcon(purpose)}
                        Start Scanning for {getScanPurposeTitle(purpose)}
                      </Button>
                    </>
                  )}

                  {teamNotFound && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                      <p className="text-red-700">Team not found. Please try scanning again.</p>
                    </div>
                  )}

                  {scannedTeam && !scanning && (
                    <div className="mt-6 space-y-6">
                      <TeamCard team={scannedTeam} isAdmin={isAdmin} />
                      
                      <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                        <h3 className="font-medium text-green-800 mb-2">
                          {purpose === "entry" ? "Team Registered Successfully" : `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Status Updated`}
                        </h3>
                        <p className="text-sm">
                          {purpose === "entry" 
                            ? `Team ${scannedTeam.name} has been registered for the event.`
                            : `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} status for ${scannedTeam.name} has been marked as ${isAdmin ? mealAction : "valid"}.`
                          }
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setScannedTeam(null);
                          startScanning(purpose as "entry" | "lunch" | "dinner" | "snacks");
                        }}
                        className="w-full"
                      >
                        Scan Another Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default QRScanner;
