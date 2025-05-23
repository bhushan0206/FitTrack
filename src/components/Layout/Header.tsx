import { useClerk } from "@clerk/clerk-react";
import { LogOut } from "lucide-react";

const Header = () => {
  const { signOut } = useClerk();

  return (
    <header className="w-full bg-gradient-to-r from-primary to-secondary shadow-md py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="14" width="20" height="4" rx="2" fill="#4F46E5" />
              <rect x="2" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
              <rect x="22" y="10" width="8" height="12" rx="4" fill="#4F46E5" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">FitTrack</h1>
        </div>

        {/* Sign-out button */}
        <button
          className="bg-white text-primary font-medium py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-all flex items-center gap-2"
          onClick={() => signOut()}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
