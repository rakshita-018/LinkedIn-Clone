import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../../../../utils/api";
import { useWebSocket } from "../../../ws/Ws";
import { Messages } from "../../components/Messages/Messages";
import { useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider"
import "./Conversation.css";
import {Input } from "../../../../components/input/Input"

export function Conversation() {

  const [postingMessage, setPostingMessage] = useState(false);
  const [content, setContent] = useState("");
  const [suggestingUsers, setSuggestingUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [slectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  const [conversation, setConversation] = useState();
  const websocketClient = useWebSocket();
  const { id } = useParams();
  const navigate = useNavigate();
  const creatingNewConversation = id === "new";
  const { user } = useAuthentication();


  useEffect(() => {
    request({
      endpoint: "/api/v1/messaging/conversations",
      onSuccess: (data) => setConversations(data),
      onFailure: (error) => console.log(error),
    });
  }, []);

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/users/${user?.id}/conversations`,
      (message) => {
        const conversation = JSON.parse(message.body);
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === conversation.id);
          if (index === -1) return [conversation, ...prev];
          return prev.map((c) => (c.id === conversation.id ? conversation : c));
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [user?.id, websocketClient]);

  useEffect(() => {
    if (id === "new") {
      setConversation(null);
      request({
        // endpoint: "/api/v1/networking/connections",
        endpoint: "/api/v1/authentication/users",
        onSuccess: (data) => setSuggestingUsers(data),
          // setSuggestingUsers(data.map((c) => (c.author.id === user?.id ? c.recipient : c.author))),
        onFailure: (error) => console.log(error),
      });
    } else {
      request({
        endpoint: `/api/v1/messaging/conversations/${id}`,
        onSuccess: (data) => setConversation(data),
        onFailure: () => navigate("/messaging"),
      });
    }
  }, [id, navigate]);

  useEffect(() => {
    const subscription = websocketClient?.subscribe(
      `/topic/conversations/${conversation?.id}/messages`,
      (data) => {
        const message = JSON.parse(data.body);
        setConversation((prev) => {
          if (!prev) return null;
          const index = prev.messages.findIndex((m) => m.id === message.id);
          if (index === -1) return { ...prev, messages: [...prev.messages, message] };
          return {
            ...prev,
            messages: prev.messages.map((m) => (m.id === message.id ? message : m)),
          };
        });
      }
    );
    return () => subscription?.unsubscribe();
  }, [conversation?.id, websocketClient]);

  async function addMessageToConversation(e) {
    e.preventDefault();
    setPostingMessage(true);
    await request({
      endpoint: `/api/v1/messaging/conversations/${conversation?.id}/messages`,
      method: "POST",
      body: JSON.stringify({
        receiverId: conversation?.recipient.id === user?.id
          ? conversation?.author.id
          : conversation?.recipient.id,
        content,
      }),
      onFailure: (error) => console.log(error),
    });
    setPostingMessage(false);
  }

  async function createConversationWithMessage(e) {
    e.preventDefault();
    const message = { receiverId: slectedUser?.id, content };
    await request({
      endpoint: "/api/v1/messaging/conversations",
      method: "POST",
      body: JSON.stringify(message),
      onSuccess: (conversation) => navigate(`/messaging/conversations/${conversation.id}`),
      onFailure: (error) => console.log(error),
    });
  }

  const conversationUserToDisplay =
    conversation?.recipient.id === user?.id ? conversation?.author : conversation?.recipient;




  return (
    <div className={`conversation-root ${creatingNewConversation ? "conversation-new" : ""}`}>
      {(conversation || creatingNewConversation) && (
        <>
          <div className="conversation-header">
            <button className="conversation-back" onClick={() => navigate("/messaging")}>{"<"}</button>
          </div>

          {conversation && (
            <div className="conversation-top">
              <button onClick={() => navigate(`/profile/${conversationUserToDisplay?.id}`)}>
                <img
                  className="conversation-avatar"
                  src={conversationUserToDisplay?.profilePicture || "/avatar.svg"}
                  alt=""
                />
              </button>
              <div>
                <div className="conversation-name">
                  {conversationUserToDisplay?.firstName} {conversationUserToDisplay?.lastName}
                </div>
                <div className="conversation-title">
                  {conversationUserToDisplay?.position} at {conversationUserToDisplay?.company}
                </div>
              </div>
            </div>
          )}

          {creatingNewConversation && (
            <form className="conversation-form conversation-new" onSubmit={(e) => e.preventDefault()}>
              <p style={{ marginTop: "0.5rem" }}>
                Starting a new conversation {slectedUser && "with:"}
              </p>

              {!slectedUser && (
                <Input
                  size="medium"
                  disabled={suggestingUsers.length === 0}
                  type="text"
                  name="recipient"
                  placeholder="Type a name"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                />
              )}

              {slectedUser && (
                <div className="conversation-top">
                  <img className="conversation-avatar" src={slectedUser.profilePicture || "/avatar.svg"} alt="" />
                  <div>
                    <div className="conversation-name">{slectedUser.firstName} {slectedUser.lastName}</div>
                    <div className="conversation-title">{slectedUser.position} at {slectedUser.company}</div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="conversation-close">X</button>
                </div>
              )}

              {!slectedUser && !conversation && (
                <div className="conversation-suggestions">
                  {suggestingUsers
                    .filter((user) => user.firstName?.includes(search) || user.lastName?.includes(search))
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          const conv = conversations.find(
                            (c) => c.recipient.id === user.id || c.author.id === user.id
                          );
                          if (conv) navigate(`/messaging/conversations/${conv.id}`);
                          else setSelectedUser(user);
                        }}
                      >
                        <img className="conversation-avatar" src={user.profilePicture || "/avatar.svg"} alt="" />
                        <div>
                          <div className="conversation-name">{user.firstName} {user.lastName}</div>
                          <div className="conversation-title">{user.position} at {user.company}</div>
                        </div>
                      </button>
                    ))}
                  {suggestingUsers.length === 0 && (
                    <div style={{ padding: "1rem" }}>
                      You need to have connections to start a conversation.
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {conversation && <Messages messages={conversation.messages} user={user} />}

          <form
            className="conversation-form"
            onSubmit={async (e) => {
              if (!content) return;
              if (conversation) await addMessageToConversation(e);
              else await createConversationWithMessage(e);
              setContent("");
              setSelectedUser(null);
            }}
          >
            <input
              onChange={(e) => setContent(e.target.value)}
              value={content}
              name="content"
              className="conversation-textarea"
              placeholder="Write a message..."
            />
            <button
              type="submit"
              className="conversation-send"
              disabled={postingMessage || !content.trim() || (creatingNewConversation && !slectedUser)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                <path d="M476 3.7L12 222.3c-29.5 13.7-28.2 57.1 2.1 68.5l111.3 42.2L401.7 110.4 203.9 369.6v72.3c0 35.3 43 50.4 66.3 24.5l64.1-70.5 115.7 43.9c28.7 10.9 58.3-12.4 57.9-43.5l.1-372.6c.1-24.1-25-40.5-48-29.9z"/>
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
