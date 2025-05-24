import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const DataDeletionPage = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, you would:
      // 1. Validate the email belongs to a Facebook user
      // 2. Queue the deletion request
      // 3. Send confirmation email
      // 4. Process the deletion within required timeframe
      
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast({
        title: "Deletion Request Submitted",
        description: "We've received your data deletion request. You'll receive a confirmation email shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Your data deletion request has been submitted successfully. We will process your request within 30 days as required by Facebook's policies.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will receive a confirmation email at {email} with further details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Data Deletion Request
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Request deletion of your FitTrack account data
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                className="w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This should be the email associated with your Facebook account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Reason for Deletion (Optional)
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please let us know why you're deleting your account..."
                rows={3}
                disabled={isLoading}
                className="w-full bg-white/80 dark:bg-gray-700/80 border-gray-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white"
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Important Information
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Your account and all associated data will be permanently deleted</li>
                <li>• This action cannot be undone</li>
                <li>• Processing may take up to 30 days</li>
                <li>• You'll receive confirmation once deletion is complete</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 h-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Deletion Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDeletionPage;
