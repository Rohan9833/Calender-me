import IconBox from "./IconBox";

export default function StatCard({
  title,
  value,
  sub,
  icon,
  tone = "blue",
}) {
  return (
    <div className={`stat ${tone}`}>
      <IconBox icon={icon} tone={tone} />

      <div>
        <p>{title}</p>
        <h3>{value}</h3>

        {sub && (
          <small>{sub}</small>
        )}
      </div>
    </div>
  );
}