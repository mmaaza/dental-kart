import React from 'react';
import { ChatWidget } from '../components/ui';

const ChatDemoPage = () => {
  const handleSendMessage = (message) => {
    console.log('Message sent:', message);
  };

  const handleAttachFile = () => {
    console.log('Attach file clicked');
  };

  const initialMessages = [
    {
      id: 1,
      text: "Hello! How can I help you today?",
      isOwn: false,
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      text: "I have a question about my order",
      isOwn: true,
      timestamp: "10:31 AM"
    },
    {
      id: 3,
      text: "Sure! What's your order number?",
      isOwn: false,
      timestamp: "10:31 AM"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chat Widget Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This page demonstrates the mobile-first chat widget component. 
            The chat widget appears as a floating button at the bottom right of the screen.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Mobile-first responsive design</li>
                <li>• Floating chat button with smooth animations</li>
                <li>• Expandable chat interface</li>
                <li>• Real-time typing indicators</li>
                <li>• File attachment support</li>
                <li>• Voice message support</li>
                <li>• Emoji picker integration</li>
                <li>• Auto-scroll to latest messages</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Usage</h3>
              <div className="text-sm text-green-800 space-y-2">
                <p>Click the blue chat button at the bottom right to open the chat interface.</p>
                <p>Try sending a message to see the typing indicator and auto-response.</p>
                <p>The widget is fully responsive and works on all screen sizes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Customization Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <strong>Props:</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• title: Chat header title</li>
                <li>• subtitle: Chat header subtitle</li>
                <li>• initialMessages: Pre-populated messages</li>
                <li>• onSendMessage: Message handler</li>
                <li>• onAttachFile: File attachment handler</li>
                <li>• onVoiceMessage: Voice message handler</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <strong>Styling:</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Fully customizable with Tailwind CSS</li>
                <li>• Responsive design patterns</li>
                <li>• Smooth animations and transitions</li>
                <li>• Dark mode ready</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <strong>Accessibility:</strong>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Keyboard navigation support</li>
                <li>• Screen reader friendly</li>
                <li>• Focus management</li>
                <li>• ARIA labels and roles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget - This will appear on all pages */}
             <ChatWidget
         title="Customer Support"
         subtitle="We're here to help!"
         initialMessages={initialMessages}
         onSendMessage={handleSendMessage}
         onAttachFile={handleAttachFile}
       />
    </div>
  );
};

export default ChatDemoPage; 