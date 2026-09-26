export default function Avatar({
  name,
  role,
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="avatarWrap">
      <div className="avatar">
        {initials}
      </div>

      <div>
        <strong>{name}</strong>
        <small>{role}</small>
      </div>
    </div>
  );
} 