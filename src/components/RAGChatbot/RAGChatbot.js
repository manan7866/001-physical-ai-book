import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import './RAGChatbot.css';

const RAGChatbot = () => {
  const { user } = useAuthContext(); // Get user from auth context
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Function to handle text selection
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection.toString().trim() !== '') {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 0 && selectedText.length < 200) { // Limit to reasonable length
          setSelectedText(selectedText);
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Get API base URL from environment or default to relative path for integrated setup
  const getApiBaseUrl = () => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check for environment variable first (can be set via Docusaurus config)
      if (window.RAG_API_URL && window.RAG_API_URL.trim() !== '') {
        return window.RAG_API_URL;
      }

      // For both development and production, use the deployed Hugging Face backend
      // CORS is configured to allow requests from specified origins including localhost and deployed frontend
      return 'https://abdulmanan04-fastapi-chatbot.hf.space';
    }

    // Fallback to Hugging Face deployment
    return 'https://abdulmanan04-fastapi-chatbot.hf.space';
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the backend API
      const response = await fetch(`${getApiBaseUrl()}/api/chat/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          chat_history: messages.map(msg => ({ role: msg.role, content: msg.content })),
          user_id: user?.id || null  // Include user_id if user is logged in
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        role: 'assistant',
        content: data.message,
        sources: data.relevant_documents || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const askAboutSelection = async () => {
    if (!selectedText || isLoading) return;

    const userMessage = { role: 'user', content: `Explain this: "${selectedText}"`, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/rag/text-selection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          user_id: user?.id || null  // Include user_id if user is logged in
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.relevant_documents || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setSelectedText(''); // Clear the selected text
    } catch (error) {
      console.error('Error asking about selection:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Text selection popup */}
      {selectedText && (
        <div
          className="text-selection-popup"
          style={{
            position: 'fixed',
            top: `${window.pageYOffset + 10}px`,
            right: '10px',
            zIndex: 10000,
            backgroundColor: '#4f46e5',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <span>Selected: "{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}"</span>
          <button
            onClick={askAboutSelection}
            disabled={isLoading}
            className="ask-button"
          >
            Ask AI
          </button>
        </div>
      )}

      {/* Chatbot button */}
      <button
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Open chatbot"
      >
        {isOpen ? '×' : '🤖'}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Physical AI Assistant</h3>
            <button onClick={toggleChat} className="close-button">×</button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <p>Hello! I'm your Physical AI & Humanoid Robotics assistant.</p>
                <p>Select text on the page and click "Ask AI" or type your question below.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    <p>{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="sources">
                        <details>
                          <summary>Sources</summary>
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="source-item">
                              <small>📄 {source.file_name || 'Document'}</small>
                              <p>{source.content.substring(0, 150)}{source.content.length > 150 ? '...' : ''}</p>
                            </div>
                          ))}
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="message assistant">
                <div className="message-content">
                  <p>🤔 Thinking...</p>
                </div>
              </div>
            )}
          </div>

          <div className="chatbot-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about robotics, AI, ROS 2, Isaac, etc..."
              rows="2"
            />
            <button onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RAGChatbot;