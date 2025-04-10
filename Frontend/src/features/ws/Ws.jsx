import { Stomp } from "@stomp/stompjs";
import { createContext, useContext, useEffect, useState } from "react";
import SockJS from "sockjs-client";

const WsContext = createContext(null);

export const useWebSocket = () => useContext(WsContext);

export const WebSocketContextProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // const client = Stomp.client("ws://localhost:8080/ws");
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        console.log("Connected to WebSocket");
        setStompClient(client);
      },
      (error) => {
        console.error("Error connecting to WebSocket:", error);
      }
    );

    return () => {
      if (client.connected) {
        client.disconnect(() => console.log("Disconnected from WebSocket"));
      }
    };
  }, []);

  return <WsContext.Provider value={stompClient}>{children}</WsContext.Provider>;
};
