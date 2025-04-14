import { useEffect, useState } from 'react';
import { Conversation } from "./components/Conversation/Conversation"
import { request } from "../../../../utils/api"

export function Conversations(){
    const [conversations, setConversations] = useState([]);
    
    useEffect(() => {
        request({
          endpoint: "/api/v1/messaging/conversations",
          onSuccess: (data) => setConversations(data),
          onFailure: (error) => console.log(error),
        });
      }, []);
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