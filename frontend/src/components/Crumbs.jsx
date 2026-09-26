import React from "react";

export default function Crumbs({
  items,
}) {
  return (
    <div className="crumbs">
      Dashboard

      {items?.map((i) => (
        <React.Fragment key={i}>
          {" "}
          › <span>{i}</span>
        </React.Fragment>
      ))}
    </div>
  );
}