import { Metadata } from "next";
import CheckoutResult from "./CheckoutResult";

interface Props {
  // set by the /api/pay callback; only `reference` is used, the status is re-read from the DB
  searchParams: Promise<{ reference?: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { reference } = await searchParams;

  return <CheckoutResult reference={reference ?? ""} />;
};

export default page;

export const metadata: Metadata = {
  title: "تایید تراکنش",
  description: "آی‌گرافیکال: جایی که خلاقیت جان می‌گیرد!",
};
