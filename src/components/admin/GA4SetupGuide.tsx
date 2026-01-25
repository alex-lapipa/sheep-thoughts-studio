import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Settings, 
  Shield,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface GA4SetupGuideProps {
  error: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function GA4SetupGuide({ error, onRetry, isRetrying }: GA4SetupGuideProps) {
  const [copied, setCopied] = useState(false);
  
  // Parse the error to provide specific guidance
  const isPermissionError = error.includes('PERMISSION_DENIED') || error.includes('403');
  const isPropertyIdError = error.includes('property') || error.includes('Property ID');
  const isApiNotEnabled = error.includes('API has not been enabled') || error.includes('accessNotConfigured');
  const isAuthError = error.includes('authentication') || error.includes('credentials');

  const copyServiceAccountEmail = () => {
    // The service account email format from the project
    const emailHint = 'Check GOOGLE_SERVICE_ACCOUNT_KEY secret for client_email value';
    navigator.clipboard.writeText(emailHint);
    setCopied(true);
    toast.success('Hint copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-warning/50 bg-warning/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle className="text-warning-foreground">
              GA4 Setup Required
            </CardTitle>
          </div>
          <Badge variant="outline" className="border-warning text-warning-foreground">
            Configuration Needed
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Complete these steps to enable Google Analytics integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Details */}
        <Alert variant="destructive" className="bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription className="font-mono text-xs mt-2 break-all">
            {error.slice(0, 200)}{error.length > 200 ? '...' : ''}
          </AlertDescription>
        </Alert>

        {/* Setup Steps */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Setup Checklist:</h4>
          
          {/* Step 1: Enable API */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${isApiNotEnabled ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}>
            <div className="rounded-full p-1 bg-muted">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium">1. Enable Google Analytics Data API</p>
              <p className="text-sm text-muted-foreground mt-1">
                Go to Google Cloud Console → APIs & Services → Enable the "Google Analytics Data API"
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 mt-1 text-primary"
                onClick={() => window.open('https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com', '_blank')}
              >
                Open Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            {!isApiNotEnabled && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>

          {/* Step 2: Grant Access */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${isPermissionError ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}>
            <div className="rounded-full p-1 bg-muted">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium">2. Grant Service Account Access to GA4</p>
              <p className="text-sm text-muted-foreground mt-1">
                In GA4 Admin → Property Access Management → Add the service account email with "Viewer" role
              </p>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyServiceAccountEmail}
                >
                  {copied ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  Copy Email Hint
                </Button>
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-primary"
                  onClick={() => window.open('https://analytics.google.com/analytics/web/', '_blank')}
                >
                  Open GA4 Admin <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            {!isPermissionError && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>

          {/* Step 3: Verify Property ID */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${isPropertyIdError ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}>
            <div className="rounded-full p-1 bg-muted">
              <Key className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium">3. Verify GA4_PROPERTY_ID is Numeric</p>
              <p className="text-sm text-muted-foreground mt-1">
                The property ID must be numeric (e.g., <code className="bg-muted px-1 rounded">123456789</code>), 
                not a measurement ID (e.g., <code className="bg-muted px-1 rounded">G-XXXXXXX</code>)
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Find it in GA4 → Admin → Property Settings → Property ID
              </p>
            </div>
            {!isPropertyIdError && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>

          {/* Step 4: Service Account Key */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${isAuthError ? 'border-destructive/50 bg-destructive/5' : 'border-border'}`}>
            <div className="rounded-full p-1 bg-muted">
              <Key className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium">4. Verify GOOGLE_SERVICE_ACCOUNT_KEY</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ensure the secret contains valid JSON with <code className="bg-muted px-1 rounded">client_email</code>, 
                <code className="bg-muted px-1 rounded">private_key</code>, and <code className="bg-muted px-1 rounded">token_uri</code>
              </p>
            </div>
            {!isAuthError && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
          </div>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onRetry} disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
          </div>
        )}

        {/* Alternative */}
        <Alert className="bg-muted/50">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Alternative: Use Internal Analytics</AlertTitle>
          <AlertDescription>
            While GA4 is being configured, you can use the <strong>Ecommerce</strong> and <strong>Engagement</strong> tabs 
            for internal analytics data that doesn't require external API access.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
