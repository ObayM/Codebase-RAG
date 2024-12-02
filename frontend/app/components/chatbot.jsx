'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sun, Moon, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message, isBot, isDarkMode }) => (
  <div className={`flex items-end mb-4 ${isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
    <div className={`flex items-end space-x-2 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isBot
          ? isDarkMode ? 'bg-purple-700' : 'bg-purple-500'
          : isDarkMode ? 'bg-blue-700' : 'bg-blue-500'
      }`}>
        {isBot ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
      </div>
      <div className={`max-w-[70%] p-3 rounded-lg ${
        isBot 
          ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black' 
          : isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
      }`}>
        <div className="prose max-w-none text-sm dark:prose-invert">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      </div>
    </div>
  </div>
);

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // continue here
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className={`w-full max-w-2xl h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AI Chatbot</h2>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
          </button>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message.text} isBot={message.isBot} isDarkMode={isDarkMode} />
          ))}
          {isLoading && (
            <div className="flex justify-center items-center py-2">
              <div className="animate-bounce space-x-1 text-center">
                <span className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></span>
                <span className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animation-delay-150"></span>
                <span className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animation-delay-300"></span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message... (Press '/' to focus)"
              className={`flex-grow px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                  : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              className="absolute right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              disabled={isLoading}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;