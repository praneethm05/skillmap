import  { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';

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
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          <div className="flex items-center">
            <h1 className="text-xl font-light text-gray-900 tracking-tight">
       <Link to={'/'}>
         Skill Map

       </Link>
                    
          
        
            </h1>
          </div>

      
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to={'/dashboard'}
            >
              Dashboard
      </Link>
            <Link 
              to={'/skills'}
            >
              Skills
            </Link>
            <Link 
             to={'/progress'}
            >
              Progress
            </Link>

            {/* Clean logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-white-600  bg-[#1a1a1a] hover:text-red-200 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium color-white-">Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button - Minimal */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
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
            <a 
              href="#dashboard" 
              className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="#skills" 
              className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Skills
            </a>
            <a 
              href="#progress" 
              className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Progress
            </a>
            
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