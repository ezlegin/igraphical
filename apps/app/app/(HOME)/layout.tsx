import FloatingBanner from "@/components/FloatingBanner";
import Footer from "@/components/Footer";
import MobileNavbar from "@/components/MobileNavbar";
import NavBar from "@/components/NavBar";
import NotifBar from "@igraph/ui/components/NotifBar";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`antialiased max-w-screen-xl mx-auto grid grid-rows-[auto_1fr_auto] min-h-screen p-3 relative overflow-clip`}
    >
      <div className="bg-primary h-28 w-[500px] absolute opacity-15 rounded-full blur-3xl -translate-y-12 top-0 right-1/2 translate-x-1/2" />
      <div>
        {/* keeps the notif bar clear of the fixed navbar; collapses when there's no notif */}
        <div className="[&:not(:empty)]:pt-20">
          <NotifBar />
        </div>
        <NavBar />
      </div>
      <main className="relative">
        <div id="stars-group-1" />
        {children}
        <FloatingBanner />
        <MobileNavbar />
      </main>
      <Footer />
    </div>
  );
}
