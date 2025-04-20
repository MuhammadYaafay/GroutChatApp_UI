import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Reply, Trash } from "lucide-react";

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
};

type MessageBubbleProps = {
  message: Message;
  formatTime: (date: Date) => string;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, formatTime }) => {
  const { isCurrentUser, sender, text, timestamp } = message;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <Avatar className={`h-8 w-8 ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
            <AvatarImage 
              src={sender.avatar ? `${import.meta.env.VITE_API_URL}${sender.avatar}` : undefined} 
              alt={sender.name} 
            />
            <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex flex-col ${isCurrentUser ? 'items-end mr-2' : 'items-start ml-2'}`}>
          {!isCurrentUser && (
            <span className="text-xs text-gray-500 mb-1">{sender.name}</span>
          )}
          
          <div className="flex items-center group">
            <div
              className={`rounded-lg py-2 px-3 ${
                isCurrentUser
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
              <span className={`text-xs block mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                {formatTime(timestamp)}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4 text-gray-500 mx-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                <DropdownMenuItem className="cursor-pointer flex items-center">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex items-center">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy text
                </DropdownMenuItem>
                {isCurrentUser && (
                  <DropdownMenuItem className="cursor-pointer flex items-center text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
