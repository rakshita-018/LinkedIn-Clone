import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useWebSocket } from "../../../ws/Ws";
import "./LeftSideBar.css";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider"

export function LeftSideBar() {
  const [connections, setConnections] = useState([]);
  const ws = useWebSocket();
  const navigate = useNavigate();
  const {user} = useAuthentication();

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/connections?userId=" + user?.id,
      onSuccess: (data) => setConnections(data),
      onFailure: (error) => console.log(error),
    });
  }, [user?.id]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/accepted",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => [...connections, connection]);
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      "/topic/users/" + user?.id + "/connections/remove",
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((connections) => connections.filter((c) => c.id !== connection.id));
      } 
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  return (
    <div className="leftSidebar-root">
      <div className="leftSidebar-cover">
        <img src={
            user?.coverPicture
              ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.coverPicture}`
              : "/cover.jpeg"
          } alt="Cover" />
      </div>
      <button className="leftSidebar-avatar" onClick={() => navigate("/profile/" + user?.id)}>
        <img  src={
            user?.profilePicture
              ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.profilePicture}`
              : "/avatar.svg"
          } alt="" />
      </button>
      <div className="leftSidebar-name">{user?.firstName + " " + user?.lastName}</div>
      <div className="leftSidebar-title">{user?.position + " at " + user?.company}</div>
      <div className="leftSidebar-info">
        <button className="leftSidebar-item" onClick={() => navigate("/network/connections")}>
          <span className="leftSidebar-label">Connections</span>
          <span className="leftSidebar-value">
            {connections.filter((connection) => connection.status === "ACCEPTED").length}
          </span>
        </button>
      </div>
    </div>
  );
}

