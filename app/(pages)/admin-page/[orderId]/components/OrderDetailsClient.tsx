"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, X, AlertCircle, CheckCircle } from 'lucide-react';
import { deactivateTicketAction } from '../../actions';
import { useRouter } from 'next/navigation';

// Copy Button Component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

// Ticket Status Component
function TicketStatus({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'default' : 'destructive'} className="flex items-center space-x-1">
      {isActive ? (
        <>
          <CheckCircle className="h-3 w-3" />
          <span>Active</span>
        </>
      ) : (
        <>
          <X className="h-3 w-3" />
          <span>Deactivated</span>
        </>
      )}
    </Badge>
  );
}

// Deactivate Button Component
function DeactivateButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeactivate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await deactivateTicketAction(orderId);
      
      if (!result.success) {
        setError(result.error || 'Failed to deactivate ticket');
        return;
      }
      
      // Success - refresh the page to show updated status
      router.refresh();
      setShowConfirm(false);
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Deactivate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Confirm Ticket Deactivation</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Are you sure you want to deactivate this ticket? This action cannot be undone and the customer 
            will not be able to use this ticket again.
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={handleDeactivate}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              {isLoading ? 'Deactivating...' : 'Yes, Deactivate'}
            </Button>
            <Button
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowConfirm(true)}
        variant="destructive"
        className="w-full sm:w-auto"
      >
        <X className="h-4 w-4 mr-2" />
        Deactivate Ticket
      </Button>
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}

// Export components individually for use in server components
export { CopyButton, TicketStatus, DeactivateButton }; 