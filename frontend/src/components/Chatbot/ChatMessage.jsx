import React from 'react';
import ChatbotIcon from './ChatbotIcon';

const ChatMessage = ({chat}) => {
    // Check for both "model" and "bot" roles to handle any inconsistencies
    const isBotMessage = chat.role === "bot" || chat.role === "model";
    
    return(
        !chat.hideInChat &&(
        <div className={`Chatbot-message ${isBotMessage ? 'Chatbot-bot-message' : 'Chatbot-user-message'}`}>
            {isBotMessage && <ChatbotIcon/>}
            <p className="Chatbot-message-text">{chat.text}</p>
        </div>
    )
)
}

export default ChatMessage;