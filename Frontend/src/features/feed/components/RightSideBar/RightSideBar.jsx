import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../../components/Button/Button";
import { Loader } from "../../../../components/loader/Loader";
import { request } from "../../../../utils/api";
import "./RightSidebar.css";

export function RightSidebar() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    request({
      endpoint: "/api/v1/networking/suggestions?limit=2",
      onSuccess: (data) => {
        if (id) {
          setSuggestions(data.filter((s) => s.id !== id));
        } else {
          setSuggestions(data);
        }
      },
      onFailure: (error) => console.log(error),
    }).then(() => setLoading(false));
  }, [id]);

  return (
    <div className="rightSidebar-root">
      <h3 className="rightSidebar-heading">Add to your connections</h3>
      <div className="rightSidebar-items">
        {suggestions.map((suggestion) => (
          <div className="rightSidebar-item" >
            <button
              className="rightSidebar-avatar"
              onClick={() => navigate("/profile/" + suggestion.id)}
            >
              <img src={suggestion.profilePicture || "/avatar.svg"} alt="" className="rightSidebar-avatar"/>
            </button>
            <div className="rightSidebar-content">
              <button onClick={() => navigate("/profile/" + suggestion.id)}>
                <div className="rightSidebar-name">
                  {suggestion.firstName} {suggestion.lastName}
                </div>
                <div className="rightSidebar-title">
                  {suggestion.position} at {suggestion.company}
                </div>
              </button>
              <Button
                size="small"
                outline
                className="rightSidebar-button"
                onClick={() => {
                  request({
                    endpoint: "/api/v1/networking/connections?recipientId=" + suggestion.id,
                    method: "POST",
                    onSuccess: () => {
                      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
                    },
                    onFailure: (error) => console.log(error),
                  });
                }}
              >
                + Connect
              </Button>
            </div>
          </div>
        ))}

        {suggestions.length === 0 && !loading && (
          <div className="rightSidebar-empty">
            <p>No suggestions available at the moment.</p>
          </div>
        )}
        {loading && <Loader isInline />}
      </div>
    </div>
  );
}
