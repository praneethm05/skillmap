import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function LoginScreen() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen w-full bg-gray-50/20 flex items-center justify-center px-4 py-10 sm:px-6">
      <SignedOut>
        {/* Clean, centered login layout */}
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Simple, elegant branding */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-ultralight text-gray-900 mb-4 tracking-tight">
              SkillMap
            </h1>
            <p className="text-lg text-gray-500 font-normal">
              Track your learning journey with clarity and focus.
            </p>
          </div>

        
          <div >
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 bg-transparent",
                  headerTitle: "text-2xl font-light text-gray-900",
                  headerSubtitle: "text-gray-500 font-normal",
                  socialButtonsBlockButton: "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium",
                  formButtonPrimary: "bg-gray-900 hover:bg-gray-800 text-white font-medium",
                  formFieldInput: "border-gray-200 focus:border-gray-400 focus:ring-0",
                  footerActionLink: "text-gray-600 hover:text-gray-900"
                }
              }}
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Clean welcome state */}
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">
              Welcome to SkillMap
            </h1>
            <p className="text-gray-500">
              Redirecting you to your dashboard...
            </p>
          </div>
          
          <div className="flex justify-center">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12",
                  userButtonPopoverCard: "bg-white border border-gray-200 shadow-lg",
                  userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-50"
                }
              }}
            />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
