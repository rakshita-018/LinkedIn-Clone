import { useEffect, useState } from "react";
import "./TimeAgo.css";
import { timeAgo } from "../utils/date";

export function TimeAgo({ date, edited, className, ...others }) {
  const [time, setTime] = useState(timeAgo(new Date(date)));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(timeAgo(new Date(date)));
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className={`timeago-root ${className ? className : ""}`} {...others}>
      <span>{time}</span>
      {edited ? <span> . Edited</span> : null}
    </div>
  );
}