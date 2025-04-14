import { useEffect } from "react";
import { Button } from "../../../../components/Button/Button";
import { request } from "../../../../utils/api";
import { useNavigate } from "react-router-dom";
import "./Connection.css";

export const Status = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
};

export function Connection({ connection, user, setConnections }) {
  const navigate = useNavigate();
  const userToDisplay =
    connection.author.id === user?.id ? connection.recipient : connection.author;

  useEffect(() => {
    if (connection.recipient.id === user?.id) {
      request({
        endpoint: `/api/v1/networking/connections/${connection.id}/seen`,
        method: "PUT",
        onSuccess: () => {},
        onFailure: (error) => console.log(error),
      });
    }
  }, [connection.id, connection.recipient.id, setConnections, user?.id]);

  return (
    <div key={connection.id} className="connections-connection">
      <button onClick={() => navigate("/profile/" + userToDisplay.id)}>
        <img
          className="connections-avatar"
          src={userToDisplay.profilePicture || "/avatar.svg"}
          alt=""
        />
      </button>
      <button onClick={() => navigate("/profile/" + userToDisplay.id)}>
        <h3 className="connections-name">
          {userToDisplay?.firstName + " " + userToDisplay.lastName}
        </h3>
        <p>
          {userToDisplay?.position} at {userToDisplay?.company}
        </p>
      </button>
      <div className="connections-actions">
        {connection.status === Status.ACCEPTED ? (
          <Button
            size="small"
            outline
            className="connections-action"
            onClick={() => {
              request({
                endpoint: `/api/v1/networking/connections/${connection.id}`,
                method: "DELETE",
                onSuccess: () => {
                  setConnections((connections) =>
                    connections.filter((c) => c.id !== connection.id)
                  );
                },
                onFailure: (error) => console.log(error),
              });
            }}
          >
            Remove
          </Button>
        ) : (
          <>
            <Button
              size="small"
              outline
              className="connections-action"
              onClick={() => {
                request({
                  endpoint: `/api/v1/networking/connections/${connection.id}`,
                  method: "DELETE",
                  onSuccess: () => {
                    setConnections((connections) =>
                      connections.filter((c) => c.id !== connection.id)
                    );
                  },
                  onFailure: (error) => console.log(error),
                });
              }}
            >
              {user?.id === connection.author.id ? "Cancel" : "Ignore"}
            </Button>
            {user?.id === connection.recipient.id && (
              <Button
                size="small"
                className="connections-action"
                onClick={() => {
                  request({
                    endpoint: `/api/v1/networking/connections/${connection.id}`,
                    method: "PUT",
                    onSuccess: () => {
                      setConnections((connections) =>
                        connections.filter((c) => c.id !== connection.id)
                      );
                    },
                    onFailure: (error) => console.log(error),
                  });
                }}
              >
                Accept
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
