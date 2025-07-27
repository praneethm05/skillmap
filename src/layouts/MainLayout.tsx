import Navbar from '../components/Navbar';

type MainLayoutProps = {
  children: React.ReactNode;
};


export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
