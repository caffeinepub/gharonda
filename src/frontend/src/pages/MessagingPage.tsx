import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { MessageCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProperties,
  useConversation,
  useGetUserProfile,
  useSendMessage,
  useUserConversations,
} from "../hooks/useQueries";

export default function MessagingPage() {
  const { identity, login } = useInternetIdentity();
  const { data: conversations, isLoading: loadingConvs } =
    useUserConversations();
  const { data: properties } = useAllProperties();
  const sendMessage = useSendMessage();

  const [selected, setSelected] = useState<{
    propertyId: bigint;
    otherParty: Principal;
  } | null>(null);
  const [newMsg, setNewMsg] = useState("");

  const { data: messages, isLoading: loadingMsgs } = useConversation(
    selected?.propertyId,
    selected?.otherParty,
  );

  const myPrincipal = identity?.getPrincipal().toString();

  const getPropertyTitle = (id: bigint) => {
    return (
      properties?.find((p) => String(p.id) === String(id))?.title ||
      `Property #${String(id)}`
    );
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selected) return;
    try {
      await sendMessage.mutateAsync({
        propertyId: selected.propertyId,
        receiverId: selected.otherParty,
        content: newMsg.trim(),
      });
      setNewMsg("");
    } catch {
      toast.error("Failed to send message.");
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-semibold mb-3">Your Inbox</h2>
        <p className="text-muted-foreground mb-6">
          Login to access your messages with sellers and buyers.
        </p>
        <Button
          onClick={login}
          className="bg-primary"
          data-ocid="inbox.primary_button"
        >
          Login to View Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Inbox</h1>

      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations list */}
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-card">
          <div className="p-3 border-b border-border">
            <p className="font-semibold text-sm text-foreground">
              Conversations
            </p>
          </div>
          <ScrollArea className="h-[540px]">
            {loadingConvs ? (
              <div className="p-4 space-y-3" data-ocid="inbox.loading_state">
                {[1, 2, 3].map((sk) => (
                  <Skeleton key={sk} className="h-14 w-full" />
                ))}
              </div>
            ) : !conversations?.length ? (
              <div
                className="p-6 text-center text-muted-foreground text-sm"
                data-ocid="inbox.empty_state"
              >
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No conversations yet
              </div>
            ) : (
              conversations.map(([propertyId, p1, p2]) => {
                const otherParty = p1.toString() === myPrincipal ? p2 : p1;
                const isActive =
                  selected?.propertyId === propertyId &&
                  selected?.otherParty.toString() === otherParty.toString();
                return (
                  <button
                    type="button"
                    key={`${String(propertyId)}-${otherParty.toString()}`}
                    onClick={() => setSelected({ propertyId, otherParty })}
                    className={`w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors ${
                      isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                    data-ocid="inbox.item"
                  >
                    <p className="font-medium text-sm text-foreground line-clamp-1">
                      {getPropertyTitle(propertyId)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {otherParty.toString().slice(0, 20)}...
                    </p>
                  </button>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Message thread */}
        <div className="md:col-span-2 border border-border rounded-xl overflow-hidden bg-card shadow-card flex flex-col">
          {!selected ? (
            <div
              className="flex-1 flex items-center justify-center text-muted-foreground"
              data-ocid="inbox.panel"
            >
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border bg-muted/30">
                <p className="font-semibold text-sm">
                  {getPropertyTitle(selected.propertyId)}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {selected.otherParty.toString().slice(0, 24)}...
                </Badge>
              </div>
              <ScrollArea className="flex-1 p-4">
                {loadingMsgs ? (
                  <div className="space-y-3" data-ocid="inbox.loading_state">
                    {[1, 2, 3].map((sk) => (
                      <Skeleton key={sk} className="h-12 w-3/4" />
                    ))}
                  </div>
                ) : !messages?.length ? (
                  <div
                    className="text-center text-muted-foreground text-sm py-8"
                    data-ocid="inbox.empty_state"
                  >
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.senderId.toString() === myPrincipal;
                      return (
                        <motion.div
                          key={String(msg.id)}
                          initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          data-ocid="inbox.item"
                        >
                          <div
                            className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-xs mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                            >
                              {new Date(
                                Number(msg.timestamp) / 1_000_000,
                              ).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  data-ocid="inbox.input"
                />
                <Button
                  onClick={handleSend}
                  disabled={sendMessage.isPending || !newMsg.trim()}
                  className="bg-primary shrink-0"
                  data-ocid="inbox.submit_button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
