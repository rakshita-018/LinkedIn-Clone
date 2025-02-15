import React from "react";
import "./Input.css";

export function Input({ label, ...otherProps }) {
    return (
        <div className="input-root">
            <label>{label}</label>
            <input {...otherProps} />
        </div>
    );
}
