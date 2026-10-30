import { JSX } from "react";

interface Props {
  status: {
    title: string;
    trigger: string;
    subTitle: string;
    chart: JSX.Element;
  };
}

const StatusCard = ({ status }: Props) => {
  return (
    <div className="studio-card flex flex-col items-center justify-between gap-3 p-4 transition-transform duration-300 hover:-translate-y-1 lg:flex-row">
      <div className="space-y-1 text-center lg:text-right">
        <p className="text-xs text-muted-foreground">{status.title}</p>
        <p className="text-lg font-bold">{status.trigger}</p>
        <p className="text-[11px] text-muted-foreground">{status.subTitle}</p>
      </div>

      {status.chart}
    </div>
  );
};

export default StatusCard;
