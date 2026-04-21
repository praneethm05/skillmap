import Navbar from '../components/Navbar';

type MainLayoutProps = {
  children: React.ReactNode;
};


export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content">{children}</main>
    </>
  );
}
