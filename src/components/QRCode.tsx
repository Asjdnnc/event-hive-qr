
import { QRCodeCanvas } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Team } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { toPng } from 'html-to-image';
import { useRef } from 'react';

interface QRCodeProps {
  team: Team;
  showDownload?: boolean;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ team, showDownload = true }) => {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  // Create team data to encode in QR
  const teamData = JSON.stringify({
    id: team.id,
    name: team.name,
    leader: team.leader,
    members: team.members.map(m => ({
      name: m.name,
      collegeName: m.collegeName
    })),
    status: team.status,
    foodStatus: team.foodStatus
  });

  const handleDownload = async () => {
    if (qrRef.current === null) {
      return;
    }
    
    try {
      const dataUrl = await toPng(qrRef.current, { quality: 0.95 });
      
      const link = document.createElement('a');
      link.download = `team-${team.name}-qrcode.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been downloaded successfully.",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-xs mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div ref={qrRef} className="bg-white p-4 rounded-md">
            <QRCodeCanvas
              value={teamData}
              size={200}
              level="H"
              includeMargin={true}
            />
            <div className="text-center mt-2 text-sm font-medium">
              {team.name}
            </div>
          </div>
          
          {showDownload && (
            <Button onClick={handleDownload} className="w-full">
              Download QR Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeComponent;
