import { useEffect, useState } from "react";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/Ws";
import { Connection } from "../../components/Connection/Connection";
import { Title } from "../../components/Title/Title";
import "./Invitations.css";

export function Invitations() {
  const [connexions, setConnections] = useState([]);
  const [sent, setSent] = useState(false);
  const { user } = useAuthentication();
  const ws = useWebSocket();

  const filtredConnections = sent
    ? connexions.filter((c) => c.author.id === user?.id)
    : connexions.filter((c) => c.recipient.id === user?.id);

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: setConnections,
      onFailure: console.log,
    });
  }, [user?.id]);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/users/${user?.id}/connections/new`, (data) => {
      const connection = JSON.parse(data.body);
      setConnections((prev) => [connection, ...prev]);
    });

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/users/${user?.id}/connections/accepted`, (data) => {
      const connection = JSON.parse(data.body);
      setConnections((prev) => prev.filter((c) => c.id !== connection.id));
    });

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/users/${user?.id}/connections/remove`, (data) => {
      const connection = JSON.parse(data.body);
      setConnections((prev) => prev.filter((c) => c.id !== connection.id));
    });

    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  return (
    <div className="invitation-connections">
      <Title>Invitations ({connexions.length})</Title>
      <div className="invitation-header">
        <button
          className={!sent ? "invitation-active" : ""}
          onClick={() => setSent(false)}
        >
          Received
        </button>
        <button
          className={sent ? "invitation-active" : ""}
          onClick={() => setSent(true)}
        >
          Sent
        </button>
      </div>
      {filtredConnections.map((connection) => (
        <Connection
          key={connection.id}
          connection={connection}
          user={user}
          setConnections={setConnections}
        />
      ))}
      {filtredConnections.length === 0 && (
        <div className="invitation-empty">
          No invitation {sent ? "sent" : "received"} yet.
        </div>
      )}
    </div>
  );
}
