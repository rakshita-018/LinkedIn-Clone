import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthentication } from "../../../../features/authentication/contexts/AuthenticationContextProvider";
import "./Profile.css";
import { Button } from "../../../Button/Button";

//TODO: profile and cover pictures from storage
export function Profile({ showProfileMenu, setShowProfileMenu, setShowNavigationMenu }) {
  const { logout, user } = useAuthentication();
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [setShowProfileMenu]);

  return (
    <div className="profile-root" ref={ref}>
      <button
        className="profile-toggle"
        onClick={() => {
          setShowProfileMenu((prev) => !prev);
          if (window.innerWidth <= 1080) {
            setShowNavigationMenu(false);
          }
        }}
      >
        <img className="profile-avatar"
         src={user?.profilePicture
              ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.profilePicture}`
              : "/avatar.svg"
          } alt="" />
        <div className="profile-name">
          <div>{user?.firstName + " " + user?.lastName?.charAt(0) + "."}</div>
        </div>
      </button>

      {showProfileMenu && (
        <div className="profile-menu">
          <div className="profile-content">
            <img
              className="profile-avatar profile-left"
              src={
                user?.profilePicture
                  ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user?.profilePicture}`
                  : "/avatar.svg"
              }              
              alt=""
            />
            <div className="profile-right">
              <div className="profile-name">{user?.firstName + " " + user?.lastName}</div>
              <div className="profile-title">{user?.position + " at " + user?.company}</div>
            </div>
          </div>
          <div className="profile-links">
            <Button
              size="small"
              className="profile-button"
              outline
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/profile/" + user?.id);
              }}
            >
              View Profile
            </Button>
            <Link to="/settings"
              onClick={() => setShowProfileMenu(false)}>
              Settings And Privacy
            </Link>
            <Link to="/logout"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              Sign Out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
