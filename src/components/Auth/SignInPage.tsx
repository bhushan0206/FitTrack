import React from "react";
import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-800/30 dark:to-indigo-800/30 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800/30 dark:to-purple-800/30 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
              <rect x="2" y="10" width="8" height="12" rx="4" fill="white" />
              <rect x="22" y="10" width="8" height="12" rx="4" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Welcome to FitTrack</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Sign in to continue your fitness journey</p>
        </div>
        
        {/* Clerk Sign In Component - Remove outer frame */}
        <SignIn 
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-2xl",
              headerTitle: "text-2xl font-bold text-gray-900 dark:text-white mb-2",
              headerSubtitle: "text-gray-600 dark:text-gray-300 mb-6",
              socialButtonsBlockButton: "w-full mb-4 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors rounded-xl py-3 font-medium shadow-sm",
              socialButtonsBlockButtonText: "font-medium",
              formButtonPrimary: "w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl",
              formFieldLabel: "text-gray-700 dark:text-gray-300 font-medium mb-2 block",
              formFieldInput: "w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500",
              footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors",
              dividerLine: "bg-gray-200 dark:bg-gray-600",
              dividerText: "text-gray-500 dark:text-gray-400 text-sm font-medium px-4 bg-inherit",
              formFieldInputShowPasswordButton: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors",
              identityPreviewText: "text-gray-600 dark:text-gray-400",
              identityPreviewEditButton: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300",
              formFieldRow: "mb-4",
              formFieldAction: "mt-2",
              footer: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-600",
              footerAction: "text-center",
              footerActionText: "text-gray-600 dark:text-gray-400 text-sm",
              main: "p-8",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
              showOptionalFields: false,
            },
            variables: {
              borderRadius: "12px",
              spacingUnit: "1rem",
            }
          }}
        />
        
        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {/*
            { icon: "📊", title: "Track Progress", desc: "Monitor your daily goals" },
            { icon: "🎯", title: "Set Goals", desc: "Create custom targets" },
            { icon: "🏆", title: "Earn Rewards", desc: "Unlock achievements" }
          */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200">
              <div className="text-2xl mb-2">{"📊"}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{"Track Progress"}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{"Monitor your daily goals"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
