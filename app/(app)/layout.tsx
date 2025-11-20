import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
