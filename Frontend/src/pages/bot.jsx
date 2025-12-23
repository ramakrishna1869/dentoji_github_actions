import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import chatbot from "../assets/icons/chatbot.jpg";

const ChatBotWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Robot Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-6 w-20 h-20 rounded-full bg-white hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 shadow-[0_4px_18px_rgba(0,0,0,0.25)]"
        aria-label="Open chat bot"
      >
        <img
          src={chatbot}
          alt="Chat Bot"
          className="w-14 h-14 rounded-full animate-robot-float"
        />
      </button>

      {isModalOpen && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Chat Window Panel */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slideInRounded">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-blue-600 rounded-bl-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-blue-100">Online • Ready to help</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
              
              {/* ✅ Replaced Emoji with Chatbot Image */}
              <div className="w-24 h-24 rounded-full shadow-md mb-4 animate-bounce-slow overflow-hidden">
                <img src={chatbot} alt="Chat Bot" className="w-full h-full object-cover" />
              </div>

              <h4 className="text-2xl font-semibold text-blue-600 mb-2">Coming Soon!</h4>
              <p className="text-gray-600 max-w-xs">
                Our intelligent assistant is learning to help you better 💡
              </p>
            </div>

            {/* Footer */}
            <div className="px-4 py-4 border-t bg-gray-50">
              <p className="text-xs text-center text-gray-500">✨ Chat will be available soon</p>
            </div>
          </div>
        </>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes slideInRounded {
          from { transform: translateX(100%); border-radius: 200px 0 0 200px; }
          to { transform: translateX(0); border-radius: 0; }
        }

        @keyframes robotFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-slideInRounded { animation: slideInRounded 0.35s ease-out; }
        .animate-robot-float { animation: robotFloat 3s infinite ease-in-out; }
        .animate-bounce-slow { animation: bounceSlow 3s infinite; }
      `}</style>
    </>
  );
};

export default ChatBotWidget;
