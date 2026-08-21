import FloatingBanner from "@/components/FloatingBanner";
import Footer from "@/components/Footer";
import MobileNavbar from "@/components/MobileNavbar";
import NavBar from "@/components/NavBar";
import DecorativeImage from "@igraph/ui/components/DecorativeImage";
import NotifBar from "@igraph/ui/components/NotifBar";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`antialiased max-w-screen-xl mx-auto grid grid-rows-[auto_1fr_auto] min-h-screen`}
    >
      <div className="bg-primary h-28 w-[500px] opacity-10 rounded-full blur-3xl mx-auto -translate-y-12" />
      <div>
        <NotifBar />
        <NavBar />
      </div>
      <main className="relative">
        <DecorativeImage />
        {children}
        <FloatingBanner />
        <MobileNavbar />
      </main>
      <Footer />
    </div>
  );
}
