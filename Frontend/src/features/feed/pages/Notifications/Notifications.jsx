import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { TimeAgo } from "../../components/TimeAgo/TimeAgo";
import { LeftSideBar } from "../../components/LeftSideBar/LeftSideBar";
import { RightSidebar } from "../../components/RightSideBar/RightSideBar";
import { usePageTitle } from "../../../../hooks/usePageTitle"

import './Notification.css'

const NotificationType = {
  LIKE: "LIKE",
  COMMENT: "COMMENT",
};

export function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const { user } = useAuthentication();
  usePageTitle("Notification")

  useEffect(() => {
    const fetchNotifications = async () => {
      await request({
        endpoint: "/api/v1/notifications",
        onSuccess: setNotifications,
        onFailure: (error) => console.log(error),
      });
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-root">
      <div className="notification-left">
        <LeftSideBar user={user} />
      </div>
      <div className="notification-center">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            setNotifications={setNotifications}
          />
        ))}
        {notifications.length === 0 && (
          <p style={{ padding: "1rem" }}>No notifications</p>
        )}
      </div>
      <div className="notification-right">
        <RightSidebar />
      </div>
    </div>
  );
}

function Notification({ notification, setNotifications }) {
  const navigate = useNavigate();

  function markNotificationAsRead(notificationId) {
    request({
      endpoint: `/api/v1/notifications/${notificationId}`,
      method: "PUT",
      onSuccess: () => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      },
      onFailure: (error) => console.log(error),
    });
  }

  return (
    <button
      onClick={() => {
        markNotificationAsRead(notification.id);
        navigate(`/posts/${notification.resourceId}`);
      }}
      className={
        notification.read
          ? "notification-notification"
          : "notification-notification notification-unread"
      }
    >
      <img
        src={notification.actor.profilePicture || "/avatar.svg"}
        alt=""
        className="notification-avatar"
      />
      <p style={{ marginRight: "auto" }}>
        <strong>
          {notification.actor.firstName + " " + notification.actor.lastName}
        </strong>{" "}
        {notification.type === NotificationType.LIKE ? "liked" : "commented on"} your post.
      </p>
      <TimeAgo date={notification.creationDate} />
    </button>
  );
}
