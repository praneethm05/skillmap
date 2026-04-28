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
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 sm:px-6" style={{ background: 'var(--color-bg)' }}>
      <SignedOut>
        <div className="w-full max-w-4xl grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-raised)] lg:grid-cols-2">
          {/* Brand panel */}
          <div
            className="relative flex flex-col justify-center px-8 py-10 sm:px-12 sm:py-14 lg:py-20"
            style={{
              background:
                'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-strong) 100%)',
            }}
          >
            {/* Subtle dot pattern overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.5) 0.8px, transparent 0.8px)',
                backgroundSize: '8px 8px',
              }}
            />
            <div className="relative z-10">
              <h1
                className="mb-6 tracking-tight text-white"
                style={{ fontSize: 'var(--text-display)', fontWeight: 700, lineHeight: 1.15 }}
              >
                Skill<span style={{ opacity: 0.7 }}>Map</span>
              </h1>
              <p className="mb-8 max-w-sm leading-relaxed text-white/80" style={{ fontSize: 'var(--text-body)' }}>
                Structured learning paths. Focused sessions. Real progress you can see.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '◆', text: 'AI-generated learning roadmaps' },
                  { icon: '◆', text: '25-minute focused study sessions' },
                  { icon: '◆', text: 'Track progress, not just time' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-white/50">
                      {item.icon}
                    </span>
                    <span className="text-white/70" style={{ fontSize: 'var(--text-caption)' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auth panel */}
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
            <div className="mb-8 text-center lg:text-left">
              <h2
                className="mb-2 tracking-tight text-[var(--color-text)]"
                style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
              >
                Welcome back
              </h2>
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
                Sign in to continue your learning journey
              </p>
            </div>
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 bg-transparent p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-white border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text)] font-medium rounded-[0.625rem]',
                  formButtonPrimary:
                    'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-[0.625rem]',
                  formFieldInput:
                    'border-[var(--color-border)] rounded-[0.625rem] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-soft)]',
                  footerActionLink: 'text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]',
                  dividerLine: 'bg-[var(--color-border)]',
                  dividerText: 'text-[var(--color-text-subtle)]',
                },
              }}
            />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="text-center page-enter">
          <h1
            className="mb-3 tracking-tight text-[var(--color-text)]"
            style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}
          >
            Welcome to SkillMap
          </h1>
          <p className="mb-6 text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-body)' }}>
            Redirecting to your dashboard…
          </p>
          <div className="flex justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-12 h-12',
                  userButtonPopoverCard: 'border border-[var(--color-border)] shadow-[var(--shadow-raised)]',
                },
              }}
            />
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
