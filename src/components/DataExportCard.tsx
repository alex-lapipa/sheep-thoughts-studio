import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, Loader2, LogIn, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const DataExportCard = () => {
  const { user, loading: authLoading } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    if (!user) {
      toast.error("Please sign in to export your data");
      return;
    }

    setExporting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error("No valid session");
      }

      const response = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Export failed");
      }

      // Create downloadable file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bubbles-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport(new Date().toISOString());
      toast.success("Your data has been exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const clearLocalData = () => {
    // List of localStorage keys used by the app
    const keysToRemove = [
      'bubbles-question-history',
      'bubbles-favorites', 
      'bubbles-streak-count',
      'bubbles-streak-last-date',
      'bubbles-achievements',
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
    toast.success("Local browser data has been cleared");
  };

  if (authLoading) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-full shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg mb-2">Export Your Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Under GDPR Article 20, you have the right to receive your personal data in a 
              structured, commonly used format. Bubbles has interpreted this to mean "a nice 
              JSON file with all the things."
            </p>

            {user ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleExport} 
                    disabled={exporting}
                    className="gap-2"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileJson className="w-4 h-4" />
                        Download My Data
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearLocalData}
                    className="gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Clear Local Data
                  </Button>
                </div>

                {lastExport && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    Last exported: {new Date(lastExport).toLocaleString()}
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4 border text-sm">
                  <p className="font-medium mb-2">Your export includes:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Account information (email, creation date)</li>
                    <li>• Assigned roles and permissions</li>
                    <li>• Activity logs and audit trail</li>
                    <li>• Any content you've created or reviewed</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to export your account data. Local browser data (question history, 
                  favorites) is stored only in your browser and can be cleared below.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/admin/login">
                    <Button variant="outline" className="gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={clearLocalData}
                    className="gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Clear Local Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
