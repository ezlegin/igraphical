"use server";

import { assertAdmin } from "@/lib/require-admin";

import { getSessionAdmin } from "@/data/admin";
import { sendEmail } from "@igraph/utils";
import { database, ContactStatus } from "@igraph/database";

//* SEND ------------------------------------------------
export const sendContactResponse = async (options: {
  message: string;
  email: string;
  contactId: number;
}) => {
  await assertAdmin();
  const { contactId, email, message } = options;
  const respondentId = (await getSessionAdmin())?.id;
  if (!respondentId) return { error: "Admin Id is missing." };

  try {
    await database.contact.update({
      where: { id: contactId },
      data: {
        status: "REPLIED",
        ContactResponse: {
          create: {
            message,
            respondentId,
          },
        },
      },
    });

    const html = `<pre>${message}</pre>`;
    const emailRes = await sendEmail({
      to: email,
      subject: "پاسخ به پیام",
      html,
    });

    if (emailRes.error) {
      return { error: "Could not send Email..." };
    }

    return { success: "Response Message Sent Successfully." };
  } catch (error) {
    return { error: String(error) };
  }
};

//? UPDATE ------------------------------------------------

export const updateContact = async (options: {
  status: ContactStatus;
  contactId: number;
}) => {
  await assertAdmin();
  const { contactId, status } = options;

  try {
    await database.contact.update({
      where: { id: contactId },
      data: {
        status,
      },
    });

    return { success: "Updated Successfully" };
  } catch (error) {
    return { error: String(error) };
  }
};

//! DELETE ------------------------------------------------

export const deleteContact = async (contactId: number) => {
  await assertAdmin();
  try {
    await database.contact.delete({
      where: { id: contactId },
    });

    return { success: "Deleted Successfully" };
  } catch (error) {
    return { error: String(error) };
  }
};
