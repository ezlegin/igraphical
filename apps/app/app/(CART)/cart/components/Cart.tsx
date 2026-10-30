"use client";

import { Cart as CartType, Wallet } from "@igraph/database";
import { useEffect, useState } from "react";
import CartList, { CartItemType } from "./CartList";
import CheckoutForm from "./CheckoutForm";

interface Props {
  cart: CartType & { cartItem: CartItemType[] };
  wallet: Wallet | null;
}

export type priceType = {
  courseId: number;
  price: number;
  originalPrice: number;
};

const Cart = ({ cart, wallet }: Props) => {
  const initialPrices = cart.cartItem.map((item) => ({
    courseId: item.course.id,
    price: item.course.price,
    originalPrice: item.course.basePrice,
  }));
  const [prices, setPrices] = useState<priceType[]>(initialPrices);

  useEffect(() => {
    setPrices(initialPrices);
  }, [cart.cartItem]);

  const courses = cart.cartItem.map((item) => item.course);

  return (
    <>
      <div className="min-w-0">
        <CartList cartItems={cart?.cartItem} prices={prices} />
      </div>

      <div className="studio-card top-6 h-min space-y-3 overflow-visible p-5 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.6)] md:p-6 lg:sticky">
        <CheckoutForm
          courses={courses}
          wallet={wallet}
          prices={prices}
          setPrices={setPrices}
        />
      </div>
    </>
  );
};

export default Cart;
