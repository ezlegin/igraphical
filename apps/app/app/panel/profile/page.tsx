import React from "react";
import UserProfileForm from "@/components/forms/profileForm";
import { getSessionUser } from "@/data/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginPageRoute } from "@/middleware";
import PanelHeader from "../components/PanelHeader";

const page = async () => {
  const user = await getSessionUser();

  if (!user) redirect(loginPageRoute);

  return (
    <>
      <PanelHeader title="پروفایل من" description="اطلاعات حساب کاربری‌ات رو اینجا مدیریت کن." />
      <UserProfileForm user={user} />
    </>
  );
};

export default page;

export const metadata: Metadata = {
  title: "پروفایل من",
};
