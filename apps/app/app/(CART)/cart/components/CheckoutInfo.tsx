import { formatPriceBy3Digits } from "@igraph/utils";

interface Props {
  baseTotal: number;
  discountAmount: number;
  totalPrice: number;
  couponAmount: number;
  usedWalletAmount: number;
  cartTotal: number;
}

const Row = ({ label, value, negative }: { label: string; value: number; negative?: boolean }) => (
  <div className={`flex items-center justify-between text-sm ${negative ? "text-muted-foreground" : "font-medium"}`}>
    <span>{label}</span>
    <span className={negative ? "text-lime" : ""}>
      {negative && "− "}
      {formatPriceBy3Digits(value)}
      <span className="mr-1 text-xs text-muted-foreground">تومان</span>
    </span>
  </div>
);

const CheckoutInfo = ({
  baseTotal,
  cartTotal,
  couponAmount,
  discountAmount,
  totalPrice,
  usedWalletAmount,
}: Props) => {
  return (
    <div className="space-y-3">
      <Row label="مجموع" value={baseTotal} />
      {discountAmount > 0 && <Row label="تخفیف ثابت" value={baseTotal - totalPrice} negative />}
      {couponAmount > 0 && <Row label="کسر کد تخفیف" value={couponAmount} negative />}
      {usedWalletAmount > 0 && <Row label="کسر کیف پول" value={usedWalletAmount} negative />}

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/15 px-4 py-3.5 ring-1 ring-primary/30">
        <span className="text-sm font-semibold">قابل پرداخت</span>
        <span className="text-xl font-black text-foreground">
          {formatPriceBy3Digits(cartTotal)}
          <span className="mr-1 text-xs font-normal text-muted-foreground">تومان</span>
        </span>
      </div>
    </div>
  );
};

export default CheckoutInfo;
