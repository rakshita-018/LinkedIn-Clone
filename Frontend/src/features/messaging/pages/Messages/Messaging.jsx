// import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Messaging.css";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { RightSidebar } from "../../../feed/components/RightSideBar/RightSideBar";
import { Conversations } from "../../components/Conversations/Conversations";
import { useEffect, useState } from "react";

export function Messaging() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const creatingNewConversation = location.pathname.includes("new");
  const onConversation = location.pathname.includes("conversations");
  const navigate = useNavigate();
  usePageTitle("Messaging");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="message-root">
      <div className="message-messaging">
        <div className="message-sidebar"
          style={{
            display: windowWidth >= 1024 || !onConversation ? "block" : "none",
          }}
        >
          <div className="message-header">
            <div className="message-title">Messaging</div>
            <button
              onClick={() => {
                navigate("conversations/new");
              }}
              className="message-new"
            >
              +
            </button>
          </div>
          {/* <Conversations/> */}
          <Conversations
            style={{
              display: onConversation && windowWidth < 1024 ? "none" : "block",
            }}
          />
        </div>
        <Outlet />
      </div>
      <div className="message-adds">
        <RightSidebar/>
      </div>  
    </div>
);
}
