"use server";

import {
  ProfileFormType,
  registerUserFormSchema,
  RegisterUserFormType,
} from "@/lib/validationSchema";
import { database } from "@igraph/database";
import { verifyLoginTicket } from "@igraph/auth";
import { detectInputType, sendRegistrationCongratsSms } from "@igraph/utils";
import { UploadApiResponse } from "cloudinary";
import { deleteCloudFile, uploadCloudFile } from "@igraph/utils";
import { getSessionUser } from "@/data/user";

//* CREATE --------------------------------------------------------

export async function registerUser(
  data: RegisterUserFormType,
  indentifer: string,
  loginToken: string,
) {
  const { email, firstName, lastName, nationalId, phone } = data;

  try {
    // An account may only be created by someone who actually received and
    // entered the OTP for `indentifer`. Without this the `phoneVerified` /
    // `emailVerified` flags below were pure self-declaration and anyone could
    // mint "verified" accounts.
    if (!verifyLoginTicket(loginToken, indentifer))
      return { error: "احراز هویت انجام نشده است. لطفا مجددا تلاش کنید." };

    //  FORM VALIDATION
    const validation = registerUserFormSchema.safeParse(data);
    if (!validation.success) return { error: "Form Inputs Not Valid" };

    // The identifier that was verified must be one of the contact details being
    // registered — otherwise the ticket proves nothing about this account.
    const identifierType = detectInputType(indentifer);
    const verifiedValue = indentifer.trim().toLowerCase();

    if (
      (identifierType === "email" &&
        email.trim().toLowerCase() !== verifiedValue) ||
      (identifierType === "phone" &&
        phone.trim() !== indentifer.trim() &&
        phone.trim() !== indentifer.trim().replace(/^(\+98|0098)/, "0"))
    ) {
      return { error: "اطلاعات وارد شده با کد تایید شده مطابقت ندارد." };
    }

    // USER LOOKUP
    const existingUser = await database.user.findFirst({
      where: {
        OR: [{ email }, { nationalId }, { phone }],
      },
    });

    if (existingUser && existingUser.email === email)
      return { error: "با این ایمیل کاربری از قبل وجود دارد." };

    if (existingUser && existingUser.phone === phone)
      return { error: "با این شماره تماس کاربری از قبل وجود دارد." };

    if (existingUser && existingUser.nationalId === nationalId)
      return { error: "با این کد ملی کاربری از قبل وجود دارد." };

    const type = identifierType;
    // CREATE USER
    const newUser = await database.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        nationalId,
        phone,
        ...(type === "email"
          ? { emailVerified: true }
          : { phoneVerified: true }),
      },
    });

    await sendRegistrationCongratsSms(newUser.firstName, newUser.phone);

    return { success: "User Created Successfully" };
  } catch (error) {
    return { error: "Error 500: " + error };
  }
}

//* UPDATE --------------------------------------------------------

export const updateUserProfile = async (data: ProfileFormType) => {
  const { firstName, lastName, image, nationalId } = data;

  try {
    // The target account is the SESSION user. `id` used to be a function
    // argument, which let anyone rewrite any user's name, national ID and
    // profile picture.
    const existingUser = await getSessionUser();
    if (!existingUser) return { error: "user not found" };

    const id = existingUser.id;

    await database.$transaction(async (tx) => {
      if (!existingUser.nationalId) {
        const existingUserByNationalCode = await tx.user.findFirst({
          where: { nationalId },
        });

        if (existingUserByNationalCode)
          throw new Error("با این کد ملی کاربری دیگر ثبت نام کرده است.");
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          nationalId: !existingUser.nationalId ? nationalId : undefined,
          fullName: `${firstName} ${lastName}`,
        },
        include: { image: true },
      });

      if (image && image instanceof File) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const { secure_url, public_id, format, bytes } = (await uploadCloudFile(
          buffer,
          {
            folder: "user",
            resource_type: "image",
            width: 300,
          },
        )) as UploadApiResponse;

        if (updatedUser.image)
          await deleteCloudFile(updatedUser.image.public_id);

        await tx.image.upsert({
          where: { userId: updatedUser.id },
          update: {
            url: secure_url,
            type: "USER",
            public_id,
            format,
            size: bytes,
          },
          create: {
            url: secure_url,
            public_id,
            format,
            type: "USER",
            size: bytes,
            user: {
              connect: {
                id: updatedUser.id,
              },
            },
          },
        });
      }

      return updatedUser;
    });

    return { success: "با موفقیت ذخیره شد" };
  } catch (error) {
    return { error: String(error) };
  }
};
