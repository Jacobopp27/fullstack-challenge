import { Navbar } from '@/components/layout/navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full">{children}</main>
    </>
  );
}
