import { SignIn } from "@clerk/clerk-react";
import SignInBackground from "@/components/Auth/SignInBackground";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <SignInBackground />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* App branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="14" width="20" height="4" rx="2" fill="white"/>
              <rect x="2" y="10" width="8" height="12" rx="4" fill="white"/>
              <rect x="22" y="10" width="8" height="12" rx="4" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">FitTrack</h1>
          <p className="text-text-secondary">Your Personal Fitness Journey</p>
        </div>
        
        {/* Sign in form with backdrop */}
        <div className="bg-background/90 backdrop-blur-sm rounded-lg border border-border p-6 shadow-2xl">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90',
                card: 'bg-transparent shadow-none',
                headerTitle: 'text-text',
                headerSubtitle: 'text-text-secondary',
                socialButtonsBlockButton: 'border-border text-text hover:bg-background-secondary',
                formFieldInput: 'bg-background border-border text-text',
                formFieldLabel: 'text-text',
                dividerLine: 'bg-border',
                dividerText: 'text-text-secondary',
                footerActionLink: 'text-primary hover:text-primary/80',
              }
            }}
          />
        </div>
        
        {/* Features highlight */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs text-text-secondary">Track Progress</div>
          </div>
          <div className="p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs text-text-secondary">Set Goals</div>
          </div>
          <div className="p-3 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xs text-text-secondary">Earn Badges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
