import { useEffect, useState } from "react";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/Ws";
import { Connection } from "../../components/Connection/Connection";
import { Title } from "../../components/Title/Title";
import "./Connections.css";

export function Connections() {
  const [connexions, setConnections] = useState([]);
  const { user } = useAuthentication();
  const ws = useWebSocket();

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/connections",
      onSuccess: setConnections,
      onFailure: console.log,
    });
  }, []);

  useEffect(() => {
    const subscription = ws?.subscribe(
      `/topic/users/${user?.id}/connections/accepted`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      }
    );
    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(
      `/topic/users/${user?.id}/connections/remove`,
      (data) => {
        const connection = JSON.parse(data.body);
        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      }
    );

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  return (
    <div className="connection-connections">
      <Title>Connections ({connexions.length})</Title>

      <>
        {connexions.map((connection) => (
          <Connection
            key={connection.id}
            connection={connection}
            user={user}
            setConnections={setConnections}
          />
        ))}
        {connexions.length === 0 && (
          <div className="connection-empty">No connections yet.</div>
        )}
      </>
    </div>
  );
}
