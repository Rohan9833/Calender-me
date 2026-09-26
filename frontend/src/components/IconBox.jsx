import { CheckCircle2 } from "lucide-react";

export default function IconBox({
  icon: Icon = CheckCircle2,
  tone = "blue",
}) {
  return (
    <div className={`iconbox ${tone}`}>
      <Icon size={24} />
    </div>
  );
}