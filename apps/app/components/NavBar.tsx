import { getSessionUser } from "@/data/user";
import { Image, User } from "@igraph/database";
import IgraphLogoSquare from "@igraph/ui/components/IgraphLogoSquare";
import { Button } from "@igraph/ui/components/ui/button";
import UserBar from "@igraph/ui/components/UserBar";
import NavShell from "./motion/NavShell";
import NavLinks from "./motion/NavLinks";
import Link from "next/link";

interface UserType extends User {
  image: Image | null;
}

export interface NavbarProps {
  user?: UserType | null;
}

const NavBar = async () => {
  const user = await getSessionUser();

  return (
    <NavShell>
      <Link href={"/"}>
        <IgraphLogoSquare size={40} />
      </Link>
      <NavLinks items={menuItems} />

      <div className="flex gap-2">

        {!user ? (
          <Link href={"/panel"}>
            <Button>حساب کاربری</Button>
          </Link>
        ) : (
          <UserBar user={user} />
        )}
      </div>
    </NavShell>
  );
};

export default NavBar;

const menuItems: { label: string; href: string }[] = [
  { label: "دوره‌ها", href: "/courses" },
  ...(process.env.SUBSCRIPTIONS_ENABLED === "true"
    ? [{ label: "اشتراک", href: "/plans" }]
    : []),
  { label: "وبلاگ", href: "/blog" },
  { label: "مدرسین", href: "/tutors" },
  { label: "استعلام مدرک", href: "/verify-cert" },
];
