"use client";

import { generateCertificateForUser } from "@/actions/certificate";
import { User } from "@igraph/database";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { useLoading } from "@igraph/utils";
import { Stamp } from "lucide-react";
import { useRouter } from "next/navigation";

const SubmitNewCertificate = ({
  completedAt,
  duration,
  title,
  enrollmentId,
  user,
}: {
  completedAt: Date | null;
  duration: number;
  title: string;
  enrollmentId: number;
  user: User;
}) => {
  const { loading, setLoading } = useLoading();
  const router = useRouter();

  const onSubmitNewCertificate = async () => {
    setLoading(true);
    await generateCertificateForUser({
      course: {
        completedAt: completedAt || new Date(),
        title,
        duration,
      },
      enrollmentId,
      user,
    });

    router.refresh();
    setLoading(false);
  };

  return (
    <Button
      disabled={loading}
      size={"sm"}
      variant={"outline"}
      onClick={onSubmitNewCertificate}
    >
      <Loader loading={loading} />
      <Stamp />
      صدور مدرک
    </Button>
  );
};

export default SubmitNewCertificate;
