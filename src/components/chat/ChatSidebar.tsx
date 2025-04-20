import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, LogOut, Settings, User, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { apiRequest } from "@/utils/apiUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

type ChatSidebarProps = {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  directContacts: Contact[];
  channels: Channel[];
  setChannels: (channels: Channel[]) => void;
  selectedConversation: Contact | Channel | null;
  onSelectConversation: (conversation: Contact | Channel) => void;
  onLogout: () => void;
  isMobile: boolean;
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  activeTab,
  setActiveTab,
  directContacts,
  channels,
  setChannels,
  selectedConversation,
  onSelectConversation,
  onLogout,
  isMobile
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [showNewDirectMessageDialog, setShowNewDirectMessageDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const filteredDirectContacts = directContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewDirectMessage = async () => {
    try {
      const users = await apiRequest<any[]>('/api/users');
      const filteredUsers = users.filter(u => u.id !== user?.id);
      setAvailableUsers(filteredUsers);
      setShowNewDirectMessageDialog(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    }
  };

  const handleNewChannel = async () => {
    setShowNewChannelDialog(true);
  };

  const createNewChannel = async () => {
    try {
      await apiRequest('/api/channels', {
        method: 'POST',
        body: {
          name: newChannelName,
          description: newChannelDescription,
        }
      });
      
      setShowNewChannelDialog(false);
      setNewChannelName("");
      setNewChannelDescription("");
      
      toast({
        title: "Channel Created",
        description: "Your new channel has been created successfully",
      });
      
      // Refresh channels list
      const updatedChannels = await apiRequest<any[]>('/api/channels');
      setChannels(updatedChannels);
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create channel. Please try again.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`
        ${isMobile ? 'fixed inset-0 z-40 bg-white' : 'w-80 border-r'}
        flex flex-col h-full bg-white
      `}
    >
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={() => navigate('/profile')}
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage 
                src={user?.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : undefined} 
                alt={user?.username} 
              />
              <AvatarFallback>{user?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{user?.username}</h3>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-500 hover:text-red-600">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="direct" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Direct</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Channels</span>
          </TabsTrigger>
        </TabsList>

        {/* Direct Messages */}
        <TabsContent value="direct" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2">
            <h3 className="text-sm font-medium text-gray-500">Direct Messages</h3>
            <Dialog open={showNewDirectMessageDialog} onOpenChange={setShowNewDirectMessageDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-500 hover:text-indigo-600"
                  onClick={handleNewDirectMessage}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Direct Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {availableUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                      onClick={() => {
                        onSelectConversation({
                          id: user.id,
                          name: user.username,
                          avatar: user.avatar,
                          status: "offline"
                        });
                        setShowNewDirectMessageDialog(false);
                      }}
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2">
              {filteredDirectContacts.length > 0 ? (
                filteredDirectContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                      selectedConversation && 'id' in selectedConversation && selectedConversation.id === contact.id
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectConversation(contact)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <Avatar className="h-9 w-9 mr-3">
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {contact.status === "online" && (
                          <span className="absolute bottom-0 right-3 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{contact.name}</h4>
                          {contact.unreadCount ? (
                            <Badge className="ml-2 bg-indigo-600">
                              {contact.unreadCount}
                            </Badge>
                          ) : null}
                        </div>
                        {contact.lastMessage && (
                          <p className="text-xs text-gray-500 truncate">{contact.lastMessage}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">
                  {searchQuery ? "No contacts found" : "No direct messages yet"}
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Channels */}
        <TabsContent value="channels" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2">
            <h3 className="text-sm font-medium text-gray-500">Channels</h3>
            <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-500 hover:text-indigo-600"
                  onClick={handleNewChannel}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Channel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Channel Name</label>
                    <Input
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="Enter channel name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="Enter channel description"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={createNewChannel}
                    disabled={!newChannelName.trim()}
                  >
                    Create Channel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                      selectedConversation && 'id' in selectedConversation && selectedConversation.id === channel.id
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectConversation(channel)}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                        <span className="text-sm font-medium">{channel.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{channel.name}</h4>
                          {channel.unreadCount ? (
                            <Badge className="ml-2 bg-indigo-600">
                              {channel.unreadCount}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {channel.memberCount} members
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">
                  {searchQuery ? "No channels found" : "No channels available"}
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Settings */}
      <div className="p-3 border-t">
        <Button variant="ghost" className="w-full justify-start text-gray-700">
          <Settings className="h-5 w-5 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};
