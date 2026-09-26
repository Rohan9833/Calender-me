import { ChevronDown } from "lucide-react";
import { cls } from "../utils/helpers";

export default function SelectBox({
  label = "All",
  wide = false,
}) {
  return (
    <div className={cls("selectbox", wide && "wide")}>
      {label}
      <ChevronDown size={16} />
    </div>
  );
}