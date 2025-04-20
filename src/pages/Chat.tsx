import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Search, Send, File, Image, Menu, X, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/apiUtils";
import { io, Socket } from "socket.io-client";

type Message = {
  id: number;
  text: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isCurrentUser: boolean;
  type: string;
  fileName?: string;
};

type Contact = {
  id: number;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastMessage?: string;
  unreadCount?: number;
};

type Channel = {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  unreadCount?: number;
};

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Contact | Channel | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [directContacts, setDirectContacts] = useState<Contact[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeTab, setActiveTab] = useState("direct");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      query: {
        token: localStorage.getItem('chatapp-token')
      }
    });

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
    });

    socketRef.current.on('user_status_change', (data) => {
      // Update online users list
      if (data.status === 'online') {
        setOnlineUsers(prev => [...prev, data.userId]);
      } else {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }
      
      // Update contact status
      setDirectContacts(prev => 
        prev.map(contact => 
          contact.id === data.userId 
            ? { ...contact, status: data.status } 
            : contact
        )
      );
    });

    socketRef.current.on('message', (newMessage) => {
      // Handle incoming message
      if (selectedConversation) {
        if (
          (newMessage.sender_id === selectedConversation.id && activeTab === 'direct') ||
          (newMessage.channel_id === selectedConversation.id && activeTab === 'channels')
        ) {
          const formattedMessage = formatMessage(newMessage);
          setMessages(prev => [...prev, formattedMessage]);
        }
      }
      // Update unread counts
      fetchContacts();
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedConversation, activeTab]);

  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchContacts(),
          fetchChannels()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Could not load your chats and contacts"
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Check if screen is mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [toast]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Add useEffect to sync online users
    const syncOnlineUsers = async () => {
      try {
        const response = await apiRequest<any[]>('/api/users/online');
        setOnlineUsers(response.map(user => user.id));
      } catch (error) {
        console.error('Error syncing online users:', error);
      }
    };

    // Initial sync
    syncOnlineUsers();

    // Set up interval to sync every 30 seconds
    const interval = setInterval(syncOnlineUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchContacts = async () => {
    try {
      const users = await apiRequest<any[]>('/api/users');
      const formatted: Contact[] = users.map(user => ({
        id: user.id,
        name: user.username,
        avatar: user.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : undefined,
        status: user.status,
        lastMessage: "",
        unreadCount: 0
      }));
      setDirectContacts(formatted);
      
      // Select first contact if none selected
      if (!selectedConversation && formatted.length > 0 && activeTab === 'direct') {
        setSelectedConversation(formatted[0]);
        fetchDirectMessages(formatted[0].id);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const data = await apiRequest<any[]>('/api/channels');
      const formatted: Channel[] = data.map(channel => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        memberCount: channel.member_count,
        unreadCount: 0
      }));
      setChannels(formatted);
      
      // Select first channel if none selected
      if (!selectedConversation && formatted.length > 0 && activeTab === 'channels') {
        setSelectedConversation(formatted[0]);
        fetchChannelMessages(formatted[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchDirectMessages = async (userId: number) => {
    try {
      const data = await apiRequest<any[]>(`/api/messages/direct/${userId}`);
      if (data && Array.isArray(data)) {
        const formatted = data.map(formatMessage);
        setMessages(formatted.reverse());
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      setMessages([]);
      toast({
        variant: "destructive",
        title: "Failed to load messages",
        description: "Could not load conversation messages"
      });
    }
  };

  const fetchChannelMessages = async (channelId: number) => {
    try {
      const data = await apiRequest<any[]>(`/api/messages/channel/${channelId}`);
      if (data && Array.isArray(data)) {
        const formatted = data.map(formatMessage);
        setMessages(formatted.reverse());
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      setMessages([]);
      toast({
        variant: "destructive",
        title: "Failed to load messages",
        description: "Could not load channel messages"
      });
    }
  };

  const formatMessage = (message: any): Message => {
    return {
      id: message.id,
      text: message.content,
      sender: {
        id: message.sender_id,
        name: message.username,
        avatar: message.avatar ? `${import.meta.env.VITE_API_URL}${message.avatar}` : undefined
      },
      timestamp: new Date(message.created_at),
      isCurrentUser: message.sender_id === user?.id,
      type: message.type || 'text',
      fileName: message.file_name
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;

    try {
      let messageData: any = {
        content: messageInput,
        type: 'text'
      };

      // Handle file upload if a file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'file');

        const uploadResponse = await apiRequest('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type, let the browser set it with the boundary
          }
        });

        if (!uploadResponse || !uploadResponse.fileUrl) {
          throw new Error('Failed to upload file');
        }

        messageData = {
          content: uploadResponse.fileUrl,
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          fileName: selectedFile.name
        };
      }

      if (activeTab === 'direct') {
        await apiRequest('/api/messages/direct', {
          method: 'POST',
          body: {
            ...messageData,
            recipientId: selectedConversation.id
          }
        });
      } else {
        await apiRequest('/api/messages/channel', {
          method: 'POST',
          body: {
            ...messageData,
            channelId: selectedConversation.id
          }
        });
      }

      setMessageInput('');
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Could not send your message. Please try again."
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSelectConversation = (conversation: Contact | Channel) => {
    setSelectedConversation(conversation);
    
    // Fetch messages for the selected conversation
    if (activeTab === 'direct') {
      fetchDirectMessages(conversation.id);
    } else {
      fetchChannelMessages(conversation.id);
    }
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedConversation(null);
    setMessages([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderContact = (contact: Contact) => {
    const isActive = selectedConversation?.id === contact.id;
    const isOnline = onlineUsers.includes(contact.id);
    
    return (
      <div
        key={contact.id}
        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
          isActive ? 'bg-blue-100' : 'hover:bg-gray-100'
        }`}
        onClick={() => handleSelectConversation(contact)}
      >
        <div className="relative">
          <img
            src={contact.avatar || '/default-avatar.png'}
            alt={contact.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="ml-3">
          <div className="font-medium">{contact.name}</div>
          <div className="text-sm text-gray-500">
            {contact.lastMessage || 'No messages yet'}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-indigo-800 font-medium">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex h-full">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="bg-white shadow-md"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Sidebar */}
        <ChatSidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          directContacts={directContacts}
          channels={channels}
          setChannels={setChannels}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onLogout={() => navigate('/login')}
          isMobile={isMobile}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <ChatHeader 
                conversation={selectedConversation}
                avatar={selectedConversation.avatar ? `${import.meta.env.VITE_API_URL}${selectedConversation.avatar}` : undefined}
                toggleSidebar={toggleSidebar}
              />

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-indigo-100 p-3 mb-3">
                        <MessageCircle className="h-6 w-6 text-indigo-600" />
                      </div>
                      <p className="text-gray-600">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble 
                        key={message.id}
                        message={message}
                        formatTime={formatTime}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                {filePreview && (
                  <div className="mb-2 relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-32 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setFilePreview(null);
                        setSelectedFile(null);
                      }}
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <File className="h-4 w-4" />
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button type="submit" disabled={!messageInput.trim() && !selectedFile}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
              <div className="rounded-full bg-indigo-100 p-4 mb-4">
                <MessageCircle className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 max-w-md">
                Choose a direct message or channel from the sidebar to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
