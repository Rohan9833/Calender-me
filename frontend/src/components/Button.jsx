import { cls } from "../utils/helpers";

export default function Button({
  children,
  variant = "primary",
  icon: Icon,
  onClick,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={cls("btn", variant, className)}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}