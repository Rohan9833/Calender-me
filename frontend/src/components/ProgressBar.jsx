export default function ProgressBar({
  value = 60,
  tone = "green",
}) {
  return (
    <span className="progress">
      <span
        className={tone}
        style={{
          width: `${value}%`,
        }}
      />
    </span>
  );
}