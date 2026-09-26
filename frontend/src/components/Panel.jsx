export default function Panel({
  title,
  children,
  action,
}) {
  return (
    <div className="panel">
      <div className="panelHead">
        <h3>{title}</h3>

        {action && (
          <button>{action}</button>
        )}
      </div>

      {children}
    </div>
  );
}