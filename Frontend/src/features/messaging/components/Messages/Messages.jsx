import "./Messages.css";
import { Message } from "./components/Message"

export function Messages({ messages, user }) {
    return (
      <div className="messages-root">
        {messages.map((message) => (
          <Message key={message.id} message={message} user={user} />
        ))}
      </div>
    );
}