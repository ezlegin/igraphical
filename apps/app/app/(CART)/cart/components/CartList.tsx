"use client";

import { deleteCartItem } from "@/actions/cart";
import { placeHolder } from "@/public";
import {
  CartItem,
  Course,
  Discount,
  Image as ImageType,
  Tutor,
} from "@igraph/database";
import Avatar from "@igraph/ui/components/Avatar";
import { formatPriceBy3Digits } from "@igraph/utils";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { priceType } from "./Cart";

export interface CartItemType extends CartItem {
  course: Course & {
    discount: Discount | null;
    image: ImageType | null;
    tutor: (Tutor & { image: ImageType | null }) | null;
  };
}

interface Props {
  cartItems: CartItemType[];
  prices: priceType[];
}

const CartList = ({ cartItems, prices }: Props) => {
  const router = useRouter();

  const onDeleteItem = async (cartItemId: number) => {
    const res = await deleteCartItem(cartItemId);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    if (res.success) {
      toast.success(res.success);
      router.refresh();
    }
  };

  const total = prices.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {cartItems.map((item, index) => {
          const struck =
            item.course.price !== item.course.basePrice || item.course.price !== prices[index]?.price;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-center gap-4 rounded-[1.5rem] border border-foreground/10 bg-card/50 p-3 transition-colors hover:border-foreground/20"
            >
              <Link href={`/courses/${item.course.url}`} className="shrink-0 overflow-hidden rounded-2xl">
                <Image
                  alt={item.course.title}
                  src={item.course.image?.url || placeHolder}
                  width={240}
                  height={160}
                  className="aspect-[3/2] w-28 object-cover transition-transform duration-500 group-hover:scale-105 md:w-36"
                />
              </Link>

              <div className="min-w-0 flex-1 space-y-2">
                <Link href={`/courses/${item.course.url}`} className="line-clamp-2 text-sm font-semibold leading-6 hover:text-primary md:text-base">
                  {item.course.title}
                </Link>
                {item.course.tutor && (
                  <Link href={`/tutors/${item.course.tutor.slug}`} className="flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                    <Avatar src={item.course.tutor.image?.url} size={22} />
                    {item.course.tutor.displayName}
                  </Link>
                )}
                <div className="flex items-baseline gap-2 md:hidden">
                  {struck && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPriceBy3Digits(item.course.basePrice)}
                    </span>
                  )}
                  <span className="text-sm font-bold">{formatPriceBy3Digits(prices[index]?.price)}</span>
                  <span className="text-[10px] text-muted-foreground">تومان</span>
                </div>
              </div>

              <div className="hidden text-left md:block">
                {struck && (
                  <span className="block text-xs text-muted-foreground line-through">
                    {formatPriceBy3Digits(item.course.basePrice)}
                  </span>
                )}
                <span className="text-lg font-bold">{formatPriceBy3Digits(prices[index]?.price)}</span>
                <span className="mr-1 text-xs text-muted-foreground">تومان</span>
              </div>

              <button
                onClick={() => onDeleteItem(item.id)}
                aria-label="حذف از سبد خرید"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="flex items-center justify-between rounded-[1.5rem] border border-dashed border-foreground/15 px-5 py-4">
        <span className="text-sm text-muted-foreground">جمع کل</span>
        <span>
          <span className="text-lg font-bold">{formatPriceBy3Digits(total)}</span>
          <span className="mr-1 text-xs text-muted-foreground">تومان</span>
        </span>
      </div>
    </div>
  );
};

export default CartList;
