"use client";

import { useState } from "react";
import InputForm from "./InputForm";
import OtpForm from "./OtpForm";
import RegisterForm from "./RegisterForm";
import RecaptchaWrapper from "@igraph/ui/components/RecaptchaWrapper";

interface Props {
  redirectTo?: string;
  onSuccess?: () => void;
}

const LoginForm = ({ redirectTo, onSuccess }: Props) => {
  // HOOKS
  const [loginStep, setLoginStep] = useState<"INPUT" | "OTP" | "REGISTER">(
    "INPUT"
  );
  const [inputFormValue, setInputFormValue] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  // Signed proof that the OTP step passed. Required by `authenticator` and
  // `registerUser`; without it neither will proceed.
  const [loginToken, setLoginToken] = useState("");

  return (
    <>
      <RecaptchaWrapper
        recaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
      >
        {loginStep === "INPUT" && (
          <InputForm
            setIsNewUser={setIsNewUser}
            setLoginStep={setLoginStep}
            setInputFormValue={setInputFormValue}
          />
        )}
        {loginStep === "OTP" && (
          <OtpForm
            setLoginStep={setLoginStep}
            inputFormValue={inputFormValue}
            isNewUser={isNewUser}
            onSuccess={onSuccess}
            redirectTo={redirectTo}
            loginToken={loginToken}
            setLoginToken={setLoginToken}
          />
        )}
      </RecaptchaWrapper>
      {loginStep === "REGISTER" && (
        <RegisterForm
          setLoginStep={setLoginStep}
          inputFormValue={inputFormValue}
          redirectTo={redirectTo}
          onSuccess={onSuccess}
          loginToken={loginToken}
        />
      )}
    </>
  );
};

export default LoginForm;
