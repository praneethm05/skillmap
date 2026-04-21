import  { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { signOut } = useClerk();

  const handleLogout = async() => {

      await signOut();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };



  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/70 bg-white/90 backdrop-blur-md" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center">
            <h1 className="text-xl font-light text-gray-900 tracking-tight">
       <Link to={'/'}>
         Skill Map

       </Link>
                    
          
        
            </h1>
          </div>

      
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to={'/dashboard'}
              className="rounded px-2 py-1 text-sm text-gray-700 transition-colors hover:text-gray-900"
            >
              Dashboard
      </Link>
            <Link 
              to={'/journey'}
              className="rounded px-2 py-1 text-sm text-gray-700 transition-colors hover:text-gray-900"
            >
              Journey
            </Link>
            <Link 
             to={'/journey'}
             className="rounded px-2 py-1 text-sm text-gray-700 transition-colors hover:text-gray-900"
            >
              Progress
            </Link>

            {/* Clean logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-lg bg-[#1a1a1a] px-4 py-2 text-white transition-all duration-200 hover:bg-black"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button - Minimal */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Clean and simple */}
        <div className={`md:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen 
            ? 'max-h-64 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="space-y-1 pt-4 border-t border-gray-100">
            <Link
              to="/dashboard"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/journey"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Journey
            </Link>
            <Link
              to="/journey"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Progress
            </Link>
            
            {/* Mobile logout */}
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 mt-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
