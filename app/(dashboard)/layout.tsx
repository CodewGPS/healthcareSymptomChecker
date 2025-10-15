// Export your actual layout component here, for example:
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
	{children}
  </div>
);

<<<<<<< HEAD
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
=======
export default DashboardLayout;
>>>>>>> upstream/main
