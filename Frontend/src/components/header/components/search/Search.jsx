import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../../utils/api";
import { Input } from "../../../Input/Input";
import "./Search.css";

export function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length > 0) {
        request({
          endpoint: "/api/v1/search/users?query=" + searchTerm,
          onSuccess: (data) => setSuggestions(data),
          onFailure: (error) => console.log("Search error:", error),
        });
      } else {
        setSuggestions([]);
      }
    };
    // fetchSuggestions();
    const delayDebounceFn = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="search-search">
      <Input
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for connections"
        size="medium"
        value={searchTerm}
      />
      {suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((user) => (
            <li key={user.id} className="search-suggestion">
              <button
                onClick={() => {
                  setSuggestions([]);
                  setSearchTerm("");
                  navigate(`/profile/${user.id}`);
                }}
              >
                <img
                  className="search-avatar"
                  src={user.profilePicture || "/avatar.svg"}
                  alt=""
                />
                <div>
                  <div className="search-name">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="search-title">
                    {user.position} at {user.company}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
