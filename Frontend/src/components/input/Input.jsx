import React from "react";
import "./Input.css";

export function Input({ label, size = "large", width, ...others }) {
  return (
    <div className={`input-root ${size}`}>
      {label && (
        <label className="label" htmlFor={others.id}>
          {label}
        </label>
      )}
      <input
        {...others}
        style={{
          width: width ? `${width}px` : "100%",
        }}
      />
    </div>
  );
}
