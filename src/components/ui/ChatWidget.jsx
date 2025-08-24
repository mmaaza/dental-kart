import * as React from "react";
import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import notificationService from "../../services/notificationService";
import { 
  MdChat, 
  MdClose, 
  MdSend
} from "react-icons/md";

// Chat message component
const ChatMessage = ({ message, isOwn, timestamp, isAdmin, senderName }) => {
  return (
    <div className={cn(
      "flex mb-3",
      isOwn ? "justify-end" : "justify-start"
    )}>
      <div className="max-w-[75%]">
        {/* Sender name tag - only show for admin messages on the left */}
        {!isOwn && isAdmin && (
          <p className="text-xs mb-1 px-1 text-gray-600 font-medium">
            {senderName}
          </p>
        )}
        
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm",
          isOwn 
            ? "bg-primary-500 text-white rounded-br-md" // User's own messages on the right
            : "bg-gray-200 text-gray-800 rounded-bl-md" // Admin messages on the left in light gray
        )}>
          <p className="break-words">{message}</p>
          <p className={cn(
            "text-xs mt-1 opacity-70",
            isOwn 
              ? "text-primary-100" // User's own messages timestamp
              : "text-gray-600" // Admin messages timestamp
          )}>
            {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
};

// Chat input component
const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-t">
      <div className="flex-1 min-w-0">
                 <textarea
           ref={inputRef}
           value={message}
           onChange={(e) => setMessage(e.target.value)}
           onKeyPress={handleKeyPress}
           placeholder="Type a message..."
           className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
           rows={1}
           style={{
             minHeight: "40px",
             maxHeight: "120px"
           }}
         />
      </div>
      
      <Button
        onClick={handleSend}
        disabled={!message.trim()}
        size="icon-sm"
        className="bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 flex-shrink-0"
      >
        <MdSend className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Main Chat Widget Component
const ChatWidget = ({ 
  className,
  title = "Chat Support",
  subtitle = "We're here to help!",
  onSendMessage,
  onAttachFile,
  ...props 
}) => {
  const { currentUser: user, isAuthenticated } = useAuth();
  const { 
    chat, 
    sendMessage, 
    isLoading, 
    error,
    unreadCount,
    markAsRead
  } = useChat();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen && chat?._id && isAuthenticated) {
      markAsRead(chat._id);
    }
  }, [isOpen, chat?._id, isAuthenticated, markAsRead]);

  // Don't show chat widget for admins
  if (user?.role === 'admin') {
    return null;
  }

  // Handle sending a message
  const handleSend = async (messageText) => {
    if (!isAuthenticated) {
      // Show login prompt or redirect to login
      return;
    }

    try {
      setIsTyping(true);
      await sendMessage(messageText);
      setMessage("");
      
      // Create notification for admin about new chat message
      try {
        await notificationService.createNotification({
          type: 'chat',
          title: 'New Chat Message',
          message: `New message from ${user?.name || 'Customer'}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
          data: {
            userName: user?.name || 'Customer',
            messagePreview: messageText.substring(0, 100),
            chatId: chat?._id
          }
        });
      } catch (error) {
        console.error('Error creating chat notification:', error);
        // Don't show error to user as message was sent successfully
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }

    // Call external handler if provided
    if (onSendMessage) {
      onSendMessage(messageText);
    }
  };

  const handleAttach = () => {
    if (onAttachFile) {
      onAttachFile();
    } else {
      console.log("Attach file functionality");
    }
  };

  // Format messages for display
  const formatMessages = () => {
    if (!chat?.messages) return [];
    
    return chat.messages.map((msg) => {
      // Try different ways to get sender ID
      const senderId = msg.sender?._id?.toString() || 
                      msg.sender?.id?.toString() || 
                      msg.sender?.toString();
      const currentUserId = user?.id?.toString() || user?._id?.toString();
      
      const isOwnMessage = senderId === currentUserId;
      const isAdminMessage = msg.sender?.role === 'admin';
      
      return {
        id: msg._id || msg.id,
        text: msg.content,
        isOwn: isOwnMessage,
        isAdmin: isAdminMessage,
        senderName: msg.sender?.name || (isAdminMessage ? 'Admin' : 'User'),
        timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true
        })
      };
    });
  };

  const messages = formatMessages();

  return (
    <>
      {/* Floating Chat Button */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Button
            className={cn(
              "fixed bottom-4 md:bottom-4 bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200",
              "bg-primary-500 text-white hover:bg-primary-600",
              "flex items-center justify-center",
              isOpen && "scale-110",
              className
            )}
            {...props}
          >
            {isOpen ? (
              <MdClose className="h-6 w-6" />
            ) : (
              <div className="relative">
                <MdChat className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            )}
          </Button>
        </Dialog.Trigger>

        {/* Chat Dialog */}
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          
          <Dialog.Content className="fixed bottom-4 md:bottom-4 bottom-20 left-1/2 transform -translate-x-1/2 md:left-auto md:transform-none md:right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[500px] bg-white rounded-t-2xl shadow-2xl border border-gray-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4">
            
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                   <MdChat className="h-5 w-5 text-white" />
                 </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
              </div>
              
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 h-[350px]">
              {isLoading && messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                  <p className="text-gray-500 text-sm">Loading chat...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MdChat className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Start a conversation</p>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-400 mt-2">Please login to chat with support</p>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message.text}
                      isOwn={message.isOwn}
                      isAdmin={message.isAdmin}
                      senderName={message.senderName}
                      timestamp={message.timestamp}
                    />
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-3">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            {isAuthenticated ? (
              <ChatInput
                onSend={handleSend}
              />
            ) : (
              <div className="p-4 bg-gray-50 border-t">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-primary-500 text-white hover:bg-primary-600"
                >
                  Login to Chat
                </Button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export { ChatWidget }; 