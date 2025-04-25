import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthentication } from "../../../../../authentication/contexts/AuthenticationContextProvider";
import { useWebSocket } from "../../../../../ws/Ws";
import "./Conversation.css";

export function Conversation({ conversation: initialConversation }) {
  const { user } = useAuthentication();
  const navigate = useNavigate();
  const { id } = useParams();
  const ws = useWebSocket();
  const [conversation, setConversation] = useState(initialConversation);

  const conversationUserToDisplay =
    conversation.recipient.id === user?.id ? conversation.author : conversation.recipient;

  const unreadMessagesCount = conversation.messages.filter(
    (message) => message.receiver.id === user?.id && !message.isRead
  ).length;

  useEffect(() => {
    const subscription = ws?.subscribe(
      `/topic/conversations/${conversation.id}/messages`,
      (data) => {
        const message = JSON.parse(data.body);
        setConversation((prevConversation) => {
          const index = prevConversation.messages.findIndex((m) => m.id === message.id);
          if (index === -1) {
            return {
              ...prevConversation,
              messages: [...prevConversation.messages, message],
            };
          }
          return {
            ...prevConversation,
            messages: prevConversation.messages.map((m) =>
              m.id === message.id ? message : m
            ),
          };
        });
        return () => subscription?.unsubscribe();
      }
    );
  }, [conversation?.id, ws]);

  const isSelected = id && Number(id) === conversation.id;

  return (
    <button
      key={conversation.id}
      className={`convo-root ${isSelected ? "convo-selected" : ""}`}
      onClick={() => navigate(`/messaging/conversations/${conversation.id}`)}
    >
      <img
        className="convo-avatar"
        src={conversationUserToDisplay.profilePicture || "/avatar.svg"}
        alt=""
        // alt={`${conversationUserToDisplay.firstName} ${conversationUserToDisplay.lastName}`}
      />

      {unreadMessagesCount > 0 && (
        <div className="convo-unread">{unreadMessagesCount}</div>
      )}

      <div>
        <div className="convo-name">
          {conversationUserToDisplay.firstName} {conversationUserToDisplay.lastName}
        </div>
        <div className="convo-content">
          {conversation.messages[conversation.messages.length - 1]?.content}
        </div>
      </div>
    </button>
  );
}
