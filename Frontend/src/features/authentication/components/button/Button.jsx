import React from "react";
import "./Button.css";

export function Button({ outline, ...others }) {
    return (
        <button className={`button-root ${outline ? "outline" : ""}`} {...others}>
            {others.children}
        </button>
    );
}
