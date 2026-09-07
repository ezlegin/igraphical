"use server";

import { User } from "@igraph/database";
import axios from "axios";
import CryptoJS from "crypto-js";

type InitiateSADADPurchaseResponse = {
  ResCode: string;
  Token: string;
};

export async function InitiateSADADPurchase(
  user: User,
  amount: number,
  orderId: number,
) {
  const rialAmount = amount * 10;
  const terminalId = process.env.SADAD_TERMINAL_ID;
  const merchantId = process.env.SADAD_MERCHANT_ID;
  const terminalKey = process.env.SADAD_TERMINAL_KEY;
  try {
    if (!terminalKey) throw new Error("Terminal Key is neccessary.");

    // const terminalId = "24095674";
    // const merchantId = "000000140336964";
    // const terminalKey = "8v8AEee8YfZX+wwc1TzfShRgH3O9WOho";

    const baseURL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://igraphical.ir";
    const key = CryptoJS.enc.Base64.parse(terminalKey);
    const plaintext = `${terminalId};${orderId};${rialAmount}`;
    const encrypted = CryptoJS.TripleDES.encrypt(plaintext, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    const signData = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    const payload = {
      MerchantId: merchantId,
      TerminalId: terminalId,
      Amount: rialAmount,
      OrderId: orderId,
      LocalDateTime: new Date(),
      ReturnUrl: `${baseURL}/api/sadad?signData=${signData}`,
      SignData: signData,
      UserId: user.id,
    };

    const response = await axios.post<InitiateSADADPurchaseResponse>(
      "https://sadad.shaparak.ir/api/v0/Request/PaymentRequest",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30_000,
      },
    );

    if (response.data.ResCode === "0") {
      return {
        success: "Success",
        data: {
          authority: response.data.Token,
          paymentUrl: `https://sadad.shaparak.ir/Purchase?token=${response.data.Token}`,
        },
      };
    } else {
      throw new Error("error initiating sadad psd payment.");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("BMI/Sadad payment initiation failed", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      return { error: "error" };
    } else {
      console.error(error);
      return { error: "error initiating sadad psd payment." };
    }
  }
}

type VerifySADADPurchaseResponse = {
  ResCode: string;
  Token: string;
};

export async function verifySADADPurchase(
  authority: string,
  signData: string,
  status: "OK" | "NOK",
) {
  if (!authority || !signData)
    return { error: "Authory and SignData is needed" };

  try {
    if (status === "NOK") return { error: "Payment Unsuccessfull" };

    const res = await axios.post<VerifySADADPurchaseResponse>(
      "https://sadad.shaparak.ir/api/v0/Advice/Verify",
      {
        Token: authority,
        SignData: signData,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30_000,
      },
    );

    console.log(res.data);

    if (res.data.ResCode === "0") {
      return { success: "Payment Successfull", data: res.data };
    } else {
      return {
        error: "Payment failed with code: " + res.data.ResCode,
      };
    }
  } catch (error) {
    return { error: String(error) };
  }
}
