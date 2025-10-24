// apps/main-app/src/components/DemoModeNotice.tsx
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Info, X } from 'lucide-react';
import { ConfigService } from '../services/ConfigService';

/**
 * Notice banner shown in production when using demo/localStorage mode
 */
export function DemoModeNotice() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Only show in production when using localStorage (demo mode)
    const isProduction = process.env.NODE_ENV === 'production';
    const usingBackend = ConfigService.shouldUseBackend();
    const dismissed = sessionStorage.getItem('demo_notice_dismissed') === 'true';
    
    setShowNotice(isProduction && !usingBackend && !dismissed);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('demo_notice_dismissed', 'true');
  };

  if (!showNotice || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert className="bg-blue-50 border-blue-200 max-w-4xl mx-auto shadow-lg">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <p className="text-sm text-blue-900 font-medium mb-1">
              🚀 Demo Mode
            </p>
            <p className="text-sm text-blue-800">
              You're using the demo version. All data is stored locally in your browser. 
              Your data is private and will be saved for your next visit on this device.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

