
import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchMessages, sendMessage, Message } from "@/lib/chat-service";
import { useToast } from "@/components/ui/use-toast";
import { User, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const { user, isAdmin, logout } = useAuthContext();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await fetchMessages();
        setMessages(fetchedMessages.reverse()); // Reverse to show newest at bottom
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: t("chat.error"),
          description: t("chat.errorFetchingMessages"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        // When a new message is inserted, fetch its user info
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.user_id)
            .single();
            
          const username = profileData?.username || 'Usuário';
          
          const newMsg: Message = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            username: username,
            message: payload.new.content,
            created_at: payload.new.created_at
          };
          
          setMessages(prev => [...prev, newMsg]);
        } catch (error) {
          console.error("Error processing new message:", error);
        }
      })
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast, t]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    try {
      const sentMessage = await sendMessage(newMessage, user);
      
      // Clear input field
      setNewMessage("");
      
      // Only add message to state if not using real-time subscription
      // if (sentMessage) {
      //   setMessages(prev => [...prev, sentMessage]);
      // }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t("chat.error"),
        description: t("chat.errorSendingMessage"),
        variant: "destructive",
      });
    }
  };
  
  // Format message timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <MainLayout isAuthenticated={!!user} isAdmin={isAdmin} onLogout={logout}>
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <MessageSquare className="inline-block mr-2" />
          {t("chat.title")}
        </h1>
        
        <div className="glass-panel p-4 min-h-[60vh] flex flex-col">
          {/* Messages area */}
          <ScrollArea className="flex-grow mb-4 h-[50vh]" ref={scrollAreaRef}>
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bullet"></div>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4 p-2">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 
                        ${msg.user_id === user?.id 
                          ? 'bg-bullet text-white rounded-br-none' 
                          : 'bg-bullet-lightgray rounded-bl-none'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-semibold text-sm">{msg.username}</span>
                        <span className="text-xs opacity-70">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {t("chat.noMessages")}
              </div>
            )}
          </ScrollArea>
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("chat.messagePlaceholder")}
              className="flex-grow bg-bullet-black border-bullet-lightgray"
            />
            <Button 
              type="submit" 
              className="bg-bullet hover:bg-bullet-dark"
              disabled={!newMessage.trim()}
            >
              {t("chat.send")}
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
