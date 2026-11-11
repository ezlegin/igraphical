"use client";

import { requestMyCertificate } from "@/actions/certificate";
import Loader from "@igraph/ui/components/Loader";
import { Button } from "@igraph/ui/components/ui/button";
import { useLoading } from "@igraph/utils";
import { Stamp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SubmitNewCertificate = ({ enrollmentId }: { enrollmentId: number }) => {
  const { loading, setLoading } = useLoading();
  const router = useRouter();

  const onSubmitNewCertificate = async () => {
    setLoading(true);
    const res = await requestMyCertificate(enrollmentId);

    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("مدرک شما با موفقیت صادر شد", {
      description: "برای دانلود مدرک، ثبت امتیاز و نظر برای دوره الزامی است.",
    });
    router.refresh();
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
