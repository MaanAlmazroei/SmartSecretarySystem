import ChatbotIcon from '../ChatbotIcon/ChatbotIcon';
import React, { useEffect, useRef, useState } from "react";
import "./Chatbot.css";
import ChatbotForm from '../ChatbotForm/ChatbotForm';
import ChatMessage from '../ChatMessage/ChatMessage';

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([{
    hideInChat: true,
    role: "model"
  }]);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatBodyRef = useRef();
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const generateBotResponse = async (history) => {
    // Format history to match Gemini's expected structure
    const contents = history.map(({role, text}) => ({
      role: role === "user" ? "user" : "model",
      parts: [{text}]
    }));

    const API_URL = `${process.env.REACT_APP_API_URL}?key=${process.env.REACT_APP_API_KEY}`;
    console.log("Full API URL:", API_URL);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: contents[contents.length - 1].parts
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Details:", errorData);
        throw new Error(errorData.error?.message || "API request failed");
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Process the response text
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")  // Removes markdown bold (**)
        .trim();

      // Replace the "Thinking..." message with the actual response
      setChatHistory(prev => {
        // Remove the "Thinking..." message
        const withoutThinking = prev.filter(msg => !(msg.text === "Thinking..." && (msg.role === "model" || msg.role === "bot")));
        // Add the new bot response
        return [...withoutThinking, { role: "model", text: apiResponseText }];
      });

    } catch(error) {
      console.error("API Error:", error);
      // Replace the "Thinking..." message with an error message
      setChatHistory(prev => {
        // Remove the "Thinking..." message
        const withoutThinking = prev.filter(msg => !(msg.text === "Thinking..." && (msg.role === "model" || msg.role === "bot")));
        // Add the error message
        return [...withoutThinking, { role: "model", text: "Sorry, I encountered an error. Please try again." }];
      });
    }
  };
  
  useEffect(()=>{
    // Auto-scroll whenever chat history updates
    if (chatBodyRef.current && !isMinimized) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  },[chatHistory, isMinimized]);

  return (
    <div className="Chatbot-wrapper">
      {isMinimized ? (
        <div className="Chatbot-minimized" onClick={toggleMinimize}>
          <div className="Chatbot-icon-container">
            <ChatbotIcon />
          </div>
        </div>
      ) : (
        <div className="Chatbot-container">
          <div className="Chatbot-popup">
            {/* Chatbot Header */}
            <div className="Chatbot-header">
              <div className="Chatbot-header-info">
                <ChatbotIcon />
                <h2 className="Chatbot-logo-text">Chatbot</h2>
              </div>
              <button 
                className="Chatbot-close-button material-symbols-rounded"
                onClick={toggleMinimize}
              >
                Drop
              </button>
            </div>

            {/* Chatbot Body */}
            <div ref={chatBodyRef} className="Chatbot-body">
              <div className="Chatbot-message Chatbot-bot-message">
                <ChatbotIcon />
                <p className="Chatbot-message-text">
                  Hey there <br /> How can I help you today?
                </p>
              </div>
              {/* Render the chat history dynamically */}
              {chatHistory.map((chat, index) => (
                <ChatMessage key={index} chat={chat}/>
              ))}
            </div>

            {/* Chatbot Footer */}
            <div className="Chatbot-footer">
              <ChatbotForm 
                chatHistory={chatHistory} 
                setChatHistory={setChatHistory} 
                generateBotResponse={generateBotResponse}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;