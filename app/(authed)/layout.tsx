import { Header } from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { isAuthenticated } from "@/lib/auth-server";
import { redirect, RedirectType } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthed = await isAuthenticated();
  if (!isAuthed) return redirect("/signin", RedirectType.push);

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <Header />
        {children}
      </SidebarProvider>
    </div>
  );
}

