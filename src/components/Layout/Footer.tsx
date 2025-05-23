import { Heart, Github, Mail, Globe } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-black dark:to-gray-900 border-t border-gray-700/30 dark:border-gray-600/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="14" width="20" height="4" rx="2" fill="white" />
                  <rect x="2" y="10" width="8" height="12" rx="4" fill="white" />
                  <rect x="22" y="10" width="8" height="12" rx="4" fill="white" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">FitTrack</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your personal fitness companion for tracking progress, setting goals, and achieving your best self.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for fitness enthusiasts</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <div className="space-y-2">
              <a href="#dashboard" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Dashboard
              </a>
              <a href="#categories" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Categories
              </a>
              <a href="#logs" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Daily Logs
              </a>
              <a href="#achievements" className="block text-gray-300 hover:text-white transition-colors text-sm">
                Achievements
              </a>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Connect</h4>
            <div className="space-y-3">
              <a 
                href="mailto:support@fittrack.com" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                support@fittrack.com
              </a>
              <a 
                href="https://github.com/fittrack" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a 
                href="https://fittrack.com" 
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors text-sm"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-white text-sm">📘</span>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-white text-sm">🐦</span>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <span className="text-white text-sm">📷</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} FitTrack. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#support" className="text-gray-400 hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
