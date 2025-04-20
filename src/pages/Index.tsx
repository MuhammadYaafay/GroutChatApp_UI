
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, Radio, LogIn, UserPlus } from "lucide-react";

const Index = () => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const features = [
    {
      title: "Real-time Messaging",
      description: "Chat with friends and colleagues instantly with our real-time messaging system",
      icon: <MessageCircle className="h-12 w-12 text-primary" />,
    },
    {
      title: "Group Chats",
      description: "Create and join group conversations to collaborate with multiple people at once",
      icon: <Users className="h-12 w-12 text-primary" />,
    },
    {
      title: "File Sharing",
      description: "Share images, documents, and other files securely with your contacts",
      icon: <Radio className="h-12 w-12 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 transition-colors duration-300">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">Connect with anyone, anywhere</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-12">
          A modern chat application with real-time messaging, group chats, and file sharing capabilities
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/login">
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-primary dark:hover:bg-primary/90"
              onMouseEnter={() => setIsHovered("login")}
              onMouseLeave={() => setIsHovered(null)}
            >
              <LogIn className={`mr-2 h-5 w-5 ${isHovered === "login" ? "animate-pulse" : ""}`} />
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-100 dark:border-primary dark:text-primary dark:hover:bg-primary/20"
              onMouseEnter={() => setIsHovered("signup")}
              onMouseLeave={() => setIsHovered(null)}
            >
              <UserPlus className={`mr-2 h-5 w-5 ${isHovered === "signup" ? "animate-pulse" : ""}`} />
              Sign Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:shadow-gray-900/30"
            >
              <CardHeader className="flex items-center justify-center">
                {feature.icon}
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle className="mb-2 dark:text-gray-100">{feature.title}</CardTitle>
                <CardDescription className="text-base dark:text-gray-300">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-white py-12 dark:bg-black transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">ChatApp</h2>
          <p className="mb-8">Connect with anyone, anywhere</p>
          <p className="text-gray-400">© 2025 ChatApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
