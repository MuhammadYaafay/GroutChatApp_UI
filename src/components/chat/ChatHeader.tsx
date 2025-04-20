import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Phone, Video, Users } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

type Contact = {
  id: number;
  name: string;
  avatar?: string;
  status?: "online" | "offline";
};

type Channel = {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
};

type ChatHeaderProps = {
  conversation: Contact | Channel;
  toggleSidebar?: () => void;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, toggleSidebar }) => {
  const isChannel = 'memberCount' in conversation;
  
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center">
        {isChannel ? (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 mr-3">
            <Users className="h-5 w-5" />
          </div>
        ) : (
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage 
              src={(conversation as Contact).avatar ? `${import.meta.env.VITE_API_URL}${(conversation as Contact).avatar}` : undefined} 
              alt={conversation.name} 
            />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div>
          <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
          {isChannel ? (
            <p className="text-xs text-gray-500">
              {(conversation as Channel).memberCount} members
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              {(conversation as Contact).status === "online" ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        {!isChannel && (
          <>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-indigo-600">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-indigo-600">
              <Video className="h-5 w-5" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-indigo-600">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isChannel ? (
              <>
                <DropdownMenuItem>View channel info</DropdownMenuItem>
                <DropdownMenuItem>View members</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Leave channel</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem>View profile</DropdownMenuItem>
                <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Block user</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
