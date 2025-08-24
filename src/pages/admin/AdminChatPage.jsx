import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Root as Card, Content as CardContent, Header as CardHeader, Title as CardTitle } from '../../components/ui/card';
import Badge from '../../components/ui/Badge';

import { 
  MdChat, 
  MdSend, 
  MdPerson, 
  MdStore,
  MdAccessTime,
  MdMessage,
  MdRefresh
} from "react-icons/md";

const AdminChatPage = () => {
  const { currentUser: user } = useAuth();
  const { 
    adminChats, 
    selectedChat, 
    adminSendMessage, 
    loadAdminChats, 
    loadAdminChat, 
    setSelectedChat,
    markAsRead,
    isLoading,
    isInitialLoading,
    error 
  } = useChat();
  
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const lastMessageCountRef = useRef(0);
  const selectedChatIdRef = useRef(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadAdminChats();
  }, [loadAdminChats]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedChat?.messages?.length > 0) {
      scrollToBottom();
    }
  }, [selectedChat?.messages?.length]);

  // Auto-refresh selected chat when new messages are detected
  useEffect(() => {
    if (selectedChat && selectedChat._id) {
      selectedChatIdRef.current = selectedChat._id;
      const currentMessageCount = selectedChat.messages?.length || 0;
      if (currentMessageCount > lastMessageCountRef.current) {
        setHasNewMessages(true);
        setShowNotification(true);
        // Clear the indicators after 3 seconds
        setTimeout(() => {
          setHasNewMessages(false);
          setShowNotification(false);
        }, 3000);
      }
      lastMessageCountRef.current = currentMessageCount;
    }
  }, [selectedChat]);

  // Mark messages as read when a chat is selected
  useEffect(() => {
    if (selectedChat?._id) {
      setIsMarkingAsRead(true);
      markAsRead(selectedChat._id)
        .catch(error => {
          console.error('Error marking messages as read:', error);
        })
        .finally(() => {
          setIsMarkingAsRead(false);
        });
    }
  }, [selectedChat?._id, markAsRead]);

  // Poll for new messages in the selected chat every 5 seconds
  useEffect(() => {
    if (!selectedChat?._id) return;

    const interval = setInterval(async () => {
      try {
        // Check if there are new messages by comparing with the last known count
        const currentChat = adminChats.find(chat => chat._id === selectedChat._id);
        if (currentChat && currentChat.messages?.length > lastMessageCountRef.current) {
          // New messages detected, refresh the selected chat
          await loadAdminChat(selectedChat._id);
          lastMessageCountRef.current = currentChat.messages.length;
        }
      } catch (error) {
        console.error('Error polling for new messages:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedChat?._id, adminChats, loadAdminChat]);

  // Update last message count when admin chats are refreshed
  useEffect(() => {
    if (selectedChatIdRef.current && adminChats.length > 0) {
      const currentChat = adminChats.find(chat => chat._id === selectedChatIdRef.current);
      if (currentChat && currentChat.messages?.length > lastMessageCountRef.current) {
        // New messages detected in the chat list, refresh the selected chat
        loadAdminChat(selectedChatIdRef.current);
        lastMessageCountRef.current = currentChat.messages.length;
      }
    }
  }, [adminChats, loadAdminChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      setIsSending(true);
      await adminSendMessage(selectedChat._id, message.trim());
      setMessage("");
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return "No messages yet";
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content.length > 50 
      ? lastMsg.content.substring(0, 50) + "..." 
      : lastMsg.content;
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages) return 0;
    return chat.messages.filter(msg => !msg.isRead && msg.sender._id !== user?._id).length;
  };

  const getParticipantInfo = (chat) => {
    const participant = chat.participants.find(p => p._id !== user?._id);
    return participant;
  };



  if (user?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100 mb-4">Access Denied</h1>
          <p className="text-admin-slate-600 dark:text-admin-slate-400">Only administrators can access this page.</p>
          <p className="text-sm text-admin-slate-500 dark:text-admin-slate-400 mt-2">Current user role: {user?.role || 'Not logged in'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-slate-900 dark:text-admin-slate-100">
            Admin Chat
          </h1>
          <p className="mt-1 text-sm text-admin-slate-600 dark:text-admin-slate-400">
            Manage conversations with users and vendors
          </p>
        </div>
        <div className="mt-4 sm:mt-0"></div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* New Message Notification */}
      {showNotification && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-pulse">
          <div className="flex items-center gap-2">
            <MdMessage className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-green-600 dark:text-green-400 font-medium">
              New message received!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1 bg-white dark:bg-admin-slate-800 shadow-sm">
          <CardHeader className="border-b border-admin-slate-200 dark:border-admin-slate-700">
            <CardTitle className="flex items-center justify-between text-admin-slate-900 dark:text-admin-slate-100">
              <div className="flex items-center gap-2">
                <MdChat className="h-5 w-5 text-admin-ucla-600 dark:text-admin-ucla-400" />
                Conversations
              </div>
              {isLoading && !isInitialLoading && (
                <div className="flex items-center gap-2 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                  <div className="w-2 h-2 bg-admin-ucla-500 rounded-full animate-pulse"></div>
                  <span>Updating...</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isInitialLoading ? (
              <div className="p-4 space-y-4">
                {/* Skeleton for chat list items */}
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border-b border-admin-slate-200 dark:border-admin-slate-700">
                    {/* Avatar skeleton */}
                    <div className="w-8 h-8 bg-admin-slate-200 dark:bg-admin-slate-700 rounded-full animate-pulse"></div>
                    
                    <div className="flex-1 space-y-2">
                      {/* Name skeleton */}
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-24 animate-pulse"></div>
                        <div className="h-5 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-12 animate-pulse"></div>
                      </div>
                      
                      {/* Message skeleton */}
                      <div className="h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-32 animate-pulse"></div>
                      
                      {/* Time skeleton */}
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded animate-pulse"></div>
                        <div className="h-3 bg-admin-slate-200 dark:bg-admin-slate-700 rounded w-12 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : adminChats.length === 0 ? (
              <div className="p-4 text-center text-admin-slate-500 dark:text-admin-slate-400">
                <MdChat className="h-12 w-12 mx-auto mb-2 text-admin-slate-300 dark:text-admin-slate-600" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {adminChats.map((chat) => {
                  const participant = getParticipantInfo(chat);
                  const unreadCount = getUnreadCount(chat);
                  const isSelected = selectedChat?._id === chat._id;
                  
                  return (
                    <div
                      key={chat._id}
                      onClick={async () => {
                        setSelectedChat(chat);
                        await loadAdminChat(chat._id);
                        // Mark messages as read when chat is selected
                        setIsMarkingAsRead(true);
                        try {
                          await markAsRead(chat._id);
                        } catch (error) {
                          console.error('Error marking messages as read:', error);
                        } finally {
                          setIsMarkingAsRead(false);
                        }
                      }}
                      className={`
                        p-4 border-b border-admin-slate-200 dark:border-admin-slate-700 cursor-pointer hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700 transition-colors
                        ${isSelected ? 'bg-admin-ucla-50 dark:bg-admin-ucla-900/20 border-admin-ucla-200 dark:border-admin-ucla-700' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {participant?.role === 'vendor' ? (
                              <MdStore className="h-8 w-8 text-blue-500" />
                            ) : (
                              <MdPerson className="h-8 w-8 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-admin-slate-900 dark:text-admin-slate-100 truncate">
                                {participant?.name || 'Unknown User'}
                              </p>
                              <Badge color={participant?.role === 'vendor' ? 'blue' : 'green'}>
                                {participant?.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-admin-slate-600 dark:text-admin-slate-400 truncate">
                              {getLastMessage(chat)}
                            </p>
                                                         <div className="flex items-center gap-2 mt-1">
                               <MdAccessTime className="h-3 w-3 text-admin-slate-400 dark:text-admin-slate-500" />
                               <span className="text-xs text-admin-slate-400 dark:text-admin-slate-500">
                                 {formatTime(chat.lastMessage)}
                               </span>
                               {isLoading && (
                                 <div className="w-1 h-1 bg-admin-ucla-500 rounded-full animate-pulse"></div>
                               )}
                             </div>
                          </div>
                        </div>
                                                 {unreadCount > 0 && (
                           <Badge color="red" className="bg-red-500 text-white">
                             {unreadCount}
                           </Badge>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 bg-white dark:bg-admin-slate-800 shadow-sm">
          <CardHeader className={`border-b border-admin-slate-200 dark:border-admin-slate-700 ${hasNewMessages ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
            {selectedChat ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getParticipantInfo(selectedChat)?.role === 'vendor' ? (
                    <MdStore className="h-6 w-6 text-blue-500" />
                  ) : (
                    <MdPerson className="h-6 w-6 text-green-500" />
                  )}
                  <div>
                    <CardTitle className="text-lg text-admin-slate-900 dark:text-admin-slate-100">
                      {getParticipantInfo(selectedChat)?.name || 'Unknown User'}
                      {hasNewMessages && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          New messages
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-admin-slate-600 dark:text-admin-slate-400">
                      {getParticipantInfo(selectedChat)?.role} • {getParticipantInfo(selectedChat)?.email}
                    </p>
                  </div>
                </div>
                                 <div className="flex items-center gap-2">
                   <Button
                     onClick={() => loadAdminChat(selectedChat._id)}
                     disabled={isLoading}
                     variant="outline"
                     size="sm"
                     className="h-8 w-8 p-0"
                   >
                     <MdRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                   </Button>
                                     {isLoading && (
                    <div className="flex items-center gap-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                      <div className="w-1.5 h-1.5 bg-admin-ucla-500 rounded-full animate-pulse"></div>
                      <span>Updating</span>
                    </div>
                  )}
                  {isMarkingAsRead && (
                    <div className="flex items-center gap-1 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Marking as read</span>
                    </div>
                  )}
                   <Badge color={getParticipantInfo(selectedChat)?.role === 'vendor' ? 'blue' : 'green'}>
                     {getParticipantInfo(selectedChat)?.role}
                   </Badge>
                 </div>
              </div>
            ) : (
              <CardTitle className="text-admin-slate-900 dark:text-admin-slate-100">Select a conversation</CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {!selectedChat ? (
              <div className="flex items-center justify-center h-[500px] text-admin-slate-500 dark:text-admin-slate-400">
                <div className="text-center">
                  <MdMessage className="h-12 w-12 mx-auto mb-2 text-admin-slate-300 dark:text-admin-slate-600" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[500px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedChat.messages?.map((msg) => {
                                                              // Convert both IDs to strings for comparison
                     const senderId = msg.sender._id?.toString();
                     const currentUserId = user?._id?.toString();
                     const isOwn = senderId === currentUserId;
                     const isAdminMessage = msg.sender?.role === 'admin';
                     const senderName = msg.sender?.name || (isAdminMessage ? 'Admin' : 'User');
                    
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[70%]">
                          {/* Sender name tag - only show for user/vendor messages on the left */}
                          {!isOwn && (
                            <p className="text-xs mb-1 px-1 text-admin-slate-600 dark:text-admin-slate-400 font-medium">
                              {senderName}
                            </p>
                          )}
                          
                          <div
                            className={`
                              rounded-lg px-3 py-2 text-sm
                              ${isOwn 
                                ? 'bg-admin-ucla-500 text-white' // Admin's own messages in UCLA blue
                                : 'bg-admin-slate-100 dark:bg-admin-slate-700 text-admin-slate-900 dark:text-admin-slate-100' // User/vendor messages in slate
                              }
                            `}
                          >
                            <p className="break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwn 
                                ? 'text-admin-ucla-100' // Admin's own messages timestamp
                                : 'text-admin-slate-500 dark:text-admin-slate-400' // User/vendor messages timestamp
                            }`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isSending}
                      className="flex-1 bg-white dark:bg-admin-slate-700 border-admin-slate-300 dark:border-admin-slate-600 text-admin-slate-900 dark:text-admin-slate-100 placeholder-admin-slate-500 dark:placeholder-admin-slate-400"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isSending}
                      className="bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white disabled:opacity-50"
                    >
                      <MdSend className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChatPage; 