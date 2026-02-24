import { UserSidebar } from "@/components/user/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1">
      <UserSidebar />
      <div className="w-lg mx-auto pt-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

