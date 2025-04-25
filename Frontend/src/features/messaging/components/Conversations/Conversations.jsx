import { useEffect, useState } from 'react';
import { Conversation } from "./components/Conversation/Conversation"
import { request } from "../../../../utils/api"
import { useWebSocket } from '../../../ws/Ws';
import { useAuthentication } from '../../../authentication/contexts/AuthenticationContextProvider';


export function Conversations(){
    const [conversations, setConversations] = useState([]);
    const { user } = useAuthentication();
    const websocketClient = useWebSocket();

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
            setConversations((prevConversations) => {
              const index = prevConversations.findIndex((c) => c.id === conversation.id);
              if (index === -1) {
                return [conversation, ...prevConversations];
              }
              return prevConversations.map((c) => (c.id === conversation.id ? conversation : c));
            });
          }
        );
        return () => subscription?.unsubscribe();
      }, [user?.id, websocketClient]);


    return (
        <div className='conversations-root'>
            {conversations.map((conversation) => (
                <Conversation key={conversation.id} conversation={conversation} />
            ))}
            
            {conversations.length === 0 && (
                <div className="conversations-welcome"
                    style={{padding: "1rem", fontSize: " 0.85rem"}}
                >
                    No Conversation to display.
                </div>
            )} 
            
        </div>
    )
}