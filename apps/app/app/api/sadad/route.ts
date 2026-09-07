import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = (formData.get("token") as string) || "";
    const resCode = formData.get("ResCode") as string;
    const orderId = formData.get("OrderId") as string;
    const signData = req.nextUrl.searchParams.get("signData") || "";

    const envBase = process.env.NEXT_PUBLIC_BASE_URL;
    const host =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const fallbackBase = host ? `https://${host}` : undefined;

    const base = envBase ?? fallbackBase ?? "https://igraphical.ir";

    const redirectUrl = new URL("/checkout-result", base);
    redirectUrl.searchParams.set("Status", resCode === "0" ? "OK" : "NOK");
    redirectUrl.searchParams.set("orderId", orderId);
    redirectUrl.searchParams.set("Authority", token);
    redirectUrl.searchParams.set("paymentMethod", "SADAD");
    redirectUrl.searchParams.set("SignData", signData);

    return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
  } catch (error) {
    console.error("Error parsing form data:", error);
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
}
