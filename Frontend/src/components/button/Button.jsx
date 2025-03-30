import React from "react";
import "./Button.css";

export function Button({outline, children, className, size="large", ...others }) {
    return (
        <button className={`button-root ${outline ? "outline" : ""} ${size} ${className || ""}`} {...others}>
            {children}
        </button>
    );
}
