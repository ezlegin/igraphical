import IgraphLogoSquare from "@igraph/ui/components/IgraphLogoSquare";
import SocialsIcon from "@igraph/ui/components/SocialsIcon";
import Link from "next/link";

const SimpleFooter = () => {
  return (
    <footer className="flex items-center justify-between rounded-[1.5rem] border border-foreground/10 bg-card/40 px-5 py-3">
      <Link href={"/"} className="flex items-center gap-3">
        <IgraphLogoSquare size={36} />
        <span className="text-xs text-muted-foreground">تمامی حقوق برای آی‌گرافیکال محفوظ است.</span>
      </Link>

      <SocialsIcon />
    </footer>
  );
};

export default SimpleFooter;
