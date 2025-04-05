import { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import './ai-bot.styles.scss'
import { GoogleGenAI } from '@google/genai';

const googleAi = new GoogleGenAI({apiKey:import.meta.env.VITE_GEMINI_API_KEY});

const AiBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleChatbox = () => {
        setIsOpen(!isOpen);
        if (!isOpen && messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    content: 'Hello! I\'m your AI assistant. How can I help you today?'
                }
            ]);
        }
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const sendMessage = async () => {
        if (inputText.trim() === '' || isLoading) return;
        
        const userMessage = {
            role: 'user',
            content: inputText.trim()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        
        try {
            // Create conversation history context
            const conversationHistory = messages
                .slice(-6)
                .map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }));
            
            // Add the latest user message
            conversationHistory.push({
                role: 'user',
                parts: [{ text: userMessage.content }]
            });
            
            // Call the Gemini API with the proper structure
            const response = await googleAi.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [{ role: 'user', parts: [{ text: userMessage.content }] }]
            });
            
            // Extract the response text correctly
            const responseText = response.text ? response.text : 
                                (response.response?.text || 'Sorry, I couldn\'t process that request.');
            
            const botResponse = {
                role: 'assistant',
                content: responseText
            };
            
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            setMessages(prev => [
                ...prev, 
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again later.'
                }
            ]);
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
        <div className="ai-bot-container">
            <button 
                className={`ai-bot-button ${isOpen ? 'active' : ''}`} 
                onClick={toggleChatbox}
                aria-label="Open AI Chat"
            >
                <FaRobot />
            </button>
            
            {isOpen && (
                <div className="ai-chat-popup">
                    <div className="chat-header">
                        <div className="chat-title">
                            <FaRobot className="header-icon" />
                            <span>AI Assistant</span>
                        </div>
                        <button className="close-button" onClick={toggleChatbox}>
                            <FaTimes />
                        </button>
                    </div>
                    
                    <div className="chat-messages">
                        {messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                <div className="message-content">
                                    {message.content.split('\n').map((line, i) => (
                                        <p key={i}>{line || <br />}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message bot-message">
                                <div className="message-content loading">
                                    <FaSpinner className="loading-spinner" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="chat-input">
                        <textarea
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button 
                            className="send-button" 
                            onClick={sendMessage}
                            disabled={inputText.trim() === '' || isLoading}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiBot;