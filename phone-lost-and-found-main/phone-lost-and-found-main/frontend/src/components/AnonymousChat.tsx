import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, Shield, Terminal, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithFallback } from "@/lib/api";
import { playUiClick, playCyberAlert } from "@/lib/sound";

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
        const finalMessages = loadedMessages.map((msg: any) => ({
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
    playUiClick();

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
    <Card className="border-0 h-[600px] flex flex-col font-tech cyber-glass">
      <CardHeader className="flex-shrink-0 border-b border-border/80 bg-card/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 shrink-0 bg-primary/15 text-primary border border-primary/30 rounded-xl flex items-center justify-center cyber-glow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base uppercase tracking-wider truncate">
                  Anonymous Return Chat
                </CardTitle>
                <span className="hud-tag text-[9px] py-0">
                  E2EE Encrypted
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate font-mono">
                Device: {deviceName} <span className="text-primary font-bold">({deviceId})</span>
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              playUiClick();
              onClose();
            }}
            className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/20 hover:text-rose-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mt-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground font-sans">
            Encrypted anonymous channel for coordination. Phone numbers and IP logs are completely isolated.
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden bg-background/50">
        <ScrollArea className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-mono text-xs">
                // No messages yet in this coordination session.
                <br />
                Type a message below to arrange a secure station drop-off.
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-xl border ${
                    message.isMe
                      ? 'bg-primary text-primary-foreground border-primary/40 cyber-glow-sm ml-4' 
                      : 'bg-card text-foreground border-border/80 mr-4'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 opacity-80" />
                      <span className="text-[11px] font-mono font-bold opacity-90 break-all">
                        {message.senderName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-70 whitespace-nowrap">{message.timestamp}</span>
                  </div>
                  <p className="text-xs font-sans break-words whitespace-pre-wrap leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-3.5 border-t border-border/80 bg-card/90">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message to finder / owner..."
              className="flex-1 h-10 text-xs font-tech bg-background"
            />
            <Button 
              onClick={handleSendMessage} 
              size="icon"
              className="h-10 w-10 cyber-glow shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};