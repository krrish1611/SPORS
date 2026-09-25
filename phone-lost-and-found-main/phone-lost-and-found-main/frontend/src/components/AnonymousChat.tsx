import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithFallback } from "@/lib/api";

interface Message {
  id: string;
  text: string;
  isMe: boolean;
  timestamp: string;
  senderName: string;
}

interface AnonymousChatProps {
  deviceId: string;
  deviceName: string;
  sessionId: string;
  onClose: () => void;
}

export const AnonymousChat = ({ deviceId, deviceName, sessionId, onClose }: AnonymousChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if current user owns this device
    const ownsDevice = user?.devices?.some(device => device.id === deviceId);
    setIsOwner(!!ownsDevice);

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, [deviceId, sessionId, user]);

  const fetchMessages = async () => {
    try {
      const res = await fetchWithFallback(`/chats/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        const loadedMessages = data.chats.map((c: any) => ({
          id: c.chat_id.toString(),
          text: c.message,
          senderName: c.sender_username,
          timestamp: new Date(c.timestamp).toLocaleTimeString()
        }));
        
        // Correct the sender logic for rendering bubbles: 
        // If the logged in user is the sender of this message, it's 'me', else 'other'
        const finalMessages = loadedMessages.map(msg => ({
          ...msg,
          isMe: msg.senderName === user?.username
        }));
        
        setMessages(finalMessages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetchWithFallback("/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceid: deviceId,
          session_id: sessionId,
          sender_username: user?.username || 'anonymous',
          receiver_username: 'unknown',
          message: newMessage
        })
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-elegant border-0 h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 shrink-0 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">Anonymous Chat</CardTitle>
              <p className="text-sm text-muted-foreground truncate">Device: {deviceName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mt-3 p-3 bg-accent/10 rounded-lg">
          <Shield className="w-4 h-4 text-accent" />
          <p className="text-xs text-muted-foreground">
            This chat is anonymous and secure. Messages are stored locally.
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isMe
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted mr-4'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium opacity-80 break-all">
                        {message.senderName}
                      </span>
                    </div>
                    <span className="text-xs opacity-60 whitespace-nowrap">{message.timestamp}</span>
                  </div>
                  <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-4 border-t bg-background">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};