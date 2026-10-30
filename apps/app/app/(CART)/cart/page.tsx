import Reveal from "@/components/motion/Reveal";
import { getSessionUser } from "@/data/user";
import { database } from "@igraph/database";
import { Button } from "@igraph/ui/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Cart from "./components/Cart";
import CheckoutSteps from "./components/CheckoutSteps";

const page = async () => {
  const userId = (await getSessionUser())?.id;

  const wallet = await database.wallet.findFirst({
    where: { userId },
  });

  const cart = await database.cart.findFirst({
    where: { userId },
    include: {
      cartItem: {
        include: {
          course: {
            include: {
              discount: true,
              image: true,
              tutor: {
                include: { image: true },
              },
            },
          },
        },
      },
    },
  });

  if (!cart || !cart.cartItem.length)
    return (
      <Reveal className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
          <span className="relative flex size-28 items-center justify-center rounded-[2rem] border border-foreground/10 bg-card text-primary">
            <ShoppingBag size={44} strokeWidth={1.5} />
          </span>
        </div>
        <h1 className="text-3xl font-black md:text-4xl">سبدت فعلا خالیه!</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          یه سر به دوره‌ها بزن؛ مطمئنیم چیزی پیدا می‌کنی که بخوای بسازیش.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/courses">
            <Button size="lg" className="group h-12 rounded-full px-7">
              مشاهده دوره‌ها
              <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="h-12 rounded-full border-foreground/15 px-7">
              صفحه اصلی
            </Button>
          </Link>
        </div>
      </Reveal>
    );

  return (
    <div className="space-y-10">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black md:text-4xl">سبد خرید</h1>
          <p className="text-sm text-muted-foreground">
            <span className="en-digits font-bold text-foreground">{cart.cartItem.length}</span> دوره آماده یادگیری
          </p>
        </div>
        <CheckoutSteps current={0} />
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Cart cart={cart} wallet={wallet} />
      </div>
    </div>
  );
};

export default page;
