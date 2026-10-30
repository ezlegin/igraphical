import { getCartByUserId } from "@/data/cart";
import { getSessionUser } from "@/data/user";
import { Image, User } from "@igraph/database";
import IgraphLogoSquare from "@igraph/ui/components/IgraphLogoSquare";
import { Button } from "@igraph/ui/components/ui/button";
import UserBar from "@igraph/ui/components/UserBar";
import NavShell from "./motion/NavShell";
import NavLinks from "./motion/NavLinks";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

interface UserType extends User {
  image: Image | null;
}

export interface NavbarProps {
  user?: UserType | null;
  isThereItemsInCart: Boolean;
}

const NavBar = async () => {
  const user = await getSessionUser();
  const cart = await getCartByUserId(user?.id);
  const isThereItemsInCart = cart?._count.cartItem ?? 0 > 0;

  return (
    <NavShell>
        <Link href={"/"}>
          <IgraphLogoSquare size={40} />
        </Link>
        <NavLinks items={menuItems} />

        <div className="flex gap-2">
          <Link href={"/cart"} className="relative">
            <Button variant={"outline"} size={"icon"}>
              <ShoppingCart />
            </Button>
            {isThereItemsInCart && (
              <div className="h-2.5 animate-pulse w-2.5 rounded-full bg-red-500 z-10 absolute top-0 right-0 m-1" />
            )}
          </Link>

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
  { label: "وبلاگ", href: "/blog" },
  { label: "مدرسین", href: "/tutors" },
  { label: "استعلام مدرک", href: "/verify-cert" },
];
