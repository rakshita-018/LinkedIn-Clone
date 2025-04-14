import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/Button/Button";
import { Loader } from "../../../../components/loader/Loader";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { request } from "../../../../utils/api";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../ws/Ws";
import { Title } from "../../components/Title/Title";
import "./Network.css";

export function Network() {
  usePageTitle("Network");
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const navigate = useNavigate();
  const ws = useWebSocket();
  const { user } = useAuthentication();

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/connections",
      onSuccess: setConnections,
      onFailure: console.log,
    });
  }, []);

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/connections?status=PENDING",
      onSuccess: setInvitations,
      onFailure: console.log,
    });
  }, []);

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/suggestions",
      onSuccess: setSuggestions,
      onFailure: console.log,
    }).then(() => setSuggestionsLoading(false));
  }, []);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/users/${user?.id}/connections/new`, (data) => {
      const connection = JSON.parse(data.body);
      setInvitations((prev) => [connection, ...prev]);
      setSuggestions((prev) =>
        prev.filter((s) => s.id !== connection.author.id && s.id !== connection.recipient.id)
      );
    });
    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/users/${user?.id}/connections/accepted`, (data) => {
      const connection = JSON.parse(data.body);
      setConnections((prev) => [connection, ...prev]);
      setInvitations((prev) => prev.filter((c) => c.id !== connection.id));
    });
    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  useEffect(() => {
    const subscription = ws?.subscribe(`/topic/users/${user?.id}/connections/remove`, (data) => {
      const connection = JSON.parse(data.body);
      setConnections((prev) => prev.filter((c) => c.id !== connection.id));
      setInvitations((prev) => prev.filter((c) => c.id !== connection.id));
    });
    return () => subscription?.unsubscribe();
  }, [user?.id, ws]);

  return (
    <div className="network-root">
      <div className="network-sidebar">
        <Title>Manage my network</Title>
        <div className="network-buttons">
          <NavLink to="invitations" className={({ isActive }) => isActive ? "active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 13.25V21H9v-7.75A2.25 2.25 0 0 1 11.25 11h1.5A2.25 2.25 0 0 1 15 13.25m5-.25h-1a2 2 0 0 0-2 2v6h5v-6a2 2 0 0 0-2-2M12 3a3 3 0 1 0 3 3 3 3 0 0 0-3-3m7.5 8A2.5 2.5 0 1 0 17 8.5a2.5 2.5 0 0 0 2.5 2.5M5 13H4a2 2 0 0 0-2 2v6h5v-6a2 2 0 0 0-2-2m-.5-7A2.5 2.5 0 1 0 7 8.5 2.5 2.5 0 0 0 4.5 6"></path>
            </svg>
            <span>Invitations</span>
            <span className="network-stat">{invitations.length}</span>
          </NavLink>
          <NavLink to="connections" className={({ isActive }) => isActive ? "active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zm5.5-3A3.5 3.5 0 1014 9.5a3.5 3.5 0 003.5 3.5zm1 2h-2a2.5 2.5 0 00-2.5 2.5V22h7v-4.5a2.5 2.5 0 00-2.5-2.5zM7.5 2A4.5 4.5 0 1012 6.5 4.49 4.49 0 007.5 2z"></path>
            </svg>
            <span>Connections</span>
            <span className="network-stat">{connections.length}</span>
          </NavLink>
        </div>
      </div>

      <div className="network-content">
        <Outlet />
        <div className="network-suggestions">
          <Title>People you may know</Title>
          {suggestions.length > 0 && (
            <div className="network-list">
              {suggestions.map((s) => (
                <div key={s.id} className="network-suggestion">
                  <img src={s.coverPicture || "/cover.jpeg"} alt="" className="network-cover" />
                  <button onClick={() => navigate(`/profile/${s.id}`)}>
                    <img src={s.profilePicture || "/avatar.svg"} className="network-avatar" alt="" />
                  </button>
                  <div className="network-info">
                    <h3 className="network-name">{s.firstName} {s.lastName}</h3>
                    <p>{s.position} at {s.company}</p>
                  </div>
                  <Button
                    outline
                    size="small"
                    className="network-connect"
                    onClick={() => {
                      request({
                        endpoint: `/api/v1/networking/connections?recipientId=${s.id}`,
                        method: "POST",
                        onSuccess: () => setSuggestions(suggestions.filter((item) => item.id !== s.id)),
                        onFailure: console.log,
                      });
                    }}
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}
          {suggestionsLoading && <Loader isInline />}
          {!suggestionsLoading && suggestions.length === 0 && <p>No suggestions available at the moment.</p>}
        </div>
      </div>
    </div>
  );
}
