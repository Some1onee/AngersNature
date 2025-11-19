import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Send, MessageSquare, Loader2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Conversation = {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants?: any[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_email?: string;
};

export const MessagingInterface = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les conversations
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      setLoading(true);
      try {
        // Récupérer les conversations de l'utilisateur
        const { data: participations } = await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            conversations (
              id,
              type,
              name,
              updated_at
            )
          `)
          .eq('user_id', user.id);

        if (participations) {
          const convs: Conversation[] = participations.map((p: any) => ({
            id: p.conversations.id,
            type: p.conversations.type,
            name: p.conversations.name,
            lastMessageTime: p.conversations.updated_at,
          }));
          setConversations(convs);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Erreur lors du chargement des conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Charger les messages d'une conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            content,
            created_at
          `)
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true });

        if (data) {
          setMessages(data);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Abonnement temps réel aux nouveaux messages
    const channel = supabase
      .channel(`conversation:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      // Mettre à jour la date de la conversation
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">
            Aucune conversation pour le moment
          </p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des amis ou rejoignez des groupes pour commencer à discuter
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[600px]">
      {/* Liste des conversations */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 p-4">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-3 rounded-lg text-left hover:bg-accent transition-colors ${
                    selectedConversation === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conv.type === 'group' ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conv.name || 'Conversation'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage || 'Nouvelle conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zone de chat */}
      <Card className="md:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">
                {conversations.find(c => c.id === selectedConversation)?.name || 'Conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez votre message..."
                    disabled={sending}
                  />
                  <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une conversation pour commencer</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
