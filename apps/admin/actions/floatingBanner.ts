"use server";

import { assertAdmin } from "@/lib/require-admin";

//* CREATE ------------------------------------------------------------

import { FloatingBannerType } from "@/lib/validationSchema";
import { database } from "@igraph/database";
import { uploadCloudFile } from "@igraph/utils";
import { UploadApiResponse } from "cloudinary";

export const createFloatingBanner = async (data: FloatingBannerType) => {
  await assertAdmin();
  const { active, couponId, image, link } = data;

  try {
    const newFloatingBanner = await database.floatingBanner.create({
      data: {
        active,
        link,
        couponId: couponId || null,
      },
    });

    if (image && image instanceof File) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const { secure_url, public_id, format, bytes } = (await uploadCloudFile(
        buffer,
        {
          folder: "floatingBanners",
          resource_type: "image",
        },
      )) as UploadApiResponse;

      // CREATE IMAGE
      await database.image.create({
        data: {
          url: secure_url,
          public_id,
          format,
          size: bytes,
          type: "FLOATING_BANNER",
          floatingBanner: {
            connect: {
              id: newFloatingBanner.id,
            },
          },
        },
      });
    }

    return { success: "Created Successfully" };
  } catch (error) {
    return { error: "Error 500: " + error };
  }
};

//? UPDATE ------------------------------------------------------------

export const updateFloatingBanner = async (data: FloatingBannerType) => {
  await assertAdmin();
  const { active, couponId, image, link } = data;

  try {
    const existingFloatingBanner = await database.floatingBanner.findFirst();

    if (!existingFloatingBanner)
      return { error: "Notif Bar Not Found, Try Again..." };

    await database.floatingBanner.update({
      where: { id: existingFloatingBanner.id },
      data: {
        active,
        couponId: couponId || null,
        link,
      },
    });

    if (image && image instanceof File) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const { secure_url, public_id, format, bytes } = (await uploadCloudFile(
        buffer,
        {
          folder: "floatingBanners",
          resource_type: "image",
        },
      )) as UploadApiResponse;

      // CREATE IMAGE
      await database.image.upsert({
        where: { floatingBannerId: existingFloatingBanner.id },
        update: {
          url: secure_url,
          public_id: public_id,
          format: format,
          type: "FLOATING_BANNER",
          size: bytes,
        },
        create: {
          url: secure_url,
          public_id: public_id,
          format: format,
          type: "FLOATING_BANNER",
          size: bytes,
          floatingBanner: { connect: { id: existingFloatingBanner.id } },
        },
      });
    }

    return { success: "Updated Successfully" };
  } catch (error) {
    return { error: "Error 500: " + error };
  }
};
