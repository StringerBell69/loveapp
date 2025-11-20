import { FloatingHearts } from "@/components/dashboard/FloatingHearts";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen gradient-love-subtle relative">
      <FloatingHearts />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
