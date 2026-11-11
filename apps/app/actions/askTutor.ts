"use server";

import { TicketMessageFormType } from "@/lib/validationSchema";
import { sendNewQaCreationSms, uploadCloudFile } from "@igraph/utils";
import { UploadApiResponse } from "cloudinary";
import { database } from "@igraph/database";
import { getSessionUser } from "@/data/user";
import { canAccessCourse, canUseMentorship } from "@/lib/access";

export const createAskTutor = async (
  data: TicketMessageFormType,
  classRoomId: string,
) => {
  const { message, file } = data;

  if (!message || message.trim() === "") {
    return { error: "Message content is required." };
  }

  // Everything below is derived from the session and the classroom row,
  // never from client-supplied ids.
  const user = await getSessionUser();
  if (!user) return { error: "لطفا مجددا وارد شوید." };

  const classroom = await database.classRoom.findUnique({
    where: { id: classRoomId },
    include: { enrollment: { include: { course: true } } },
  });
  if (!classroom || classroom.userId !== user.id)
    return { error: "کلاس درس یافت نشد" };

  const { enrollment } = classroom;
  const userId = user.id;
  const courseId = enrollment.courseId;
  const tutorId = enrollment.course.tutorId;
  const askTutorId = classroom.askTutorId;
  if (!tutorId) return { error: "مدرس این دوره یافت نشد" };

  if (
    !(await canAccessCourse(userId, enrollment.course, enrollment)) ||
    !(await canUseMentorship(userId, enrollment))
  )
    return { error: "منتورشیپ برای شما فعال نیست." };

  try {
    await database.$transaction(async (tx) => {
      let currentAskTutorId = askTutorId;

      if (!currentAskTutorId) {
        const createdAskTutor = await tx.askTutor.create({
          data: {
            courseId,
            userId,
            status: "PENDING",
            tutorId,
            classRoom: {
              connect: {
                id: classRoomId,
              },
            },
          },
        });
        currentAskTutorId = createdAskTutor.id;
      } else {
        await tx.askTutor.update({
          where: { id: currentAskTutorId },
          data: {
            status: "PENDING",
          },
        });
      }

      const newMessage = await tx.askTutorMessages.create({
        data: {
          askTutorId: currentAskTutorId,
          message,
          senderType: "USER",
        },
      });

      if (file && file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;
        const fileFormat = file.name.split(".").pop() || "raw";
        const isImageType = file.type.includes("image");

        const { secure_url, bytes, public_id, format, resource_type } =
          (await uploadCloudFile(buffer, {
            format: fileFormat,
            resource_type: isImageType ? "image" : "raw",
            folder: "ticket",
          })) as UploadApiResponse;

        await tx.file.create({
          data: {
            format: format || fileFormat,
            public_id,
            size: bytes,
            resource_type,
            fileName,
            type: "QA_ASSET",
            url: secure_url,
            askTutorMessageId: newMessage.id,
          },
        });
      }
    });

    const tutor = await database.tutor.findFirst({
      where: { id: tutorId },
      select: { phone: true },
    });

    //* SEND SMS TO TUTOR
    await sendNewQaCreationSms(tutor?.phone!);

    return { success: "پیام شما با موفقیت ارسال شد!" };
  } catch (error) {
    return { error: String(error) };
  }
};
