import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ChatThread {
  id: string;
  title: string;
  last_message: string | null;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export function useChatThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setThreads([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("chat_threads")
      .select("id,title,last_message,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    setThreads((data as ChatThread[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const createThread = async (title = "New conversation"): Promise<ChatThread | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (error || !data) return null;
    await refetch();
    return data as ChatThread;
  };

  const renameThread = async (id: string, title: string) => {
    await supabase.from("chat_threads").update({ title }).eq("id", id);
    setThreads((arr) => arr.map((t) => (t.id === id ? { ...t, title } : t)));
  };

  const deleteThread = async (id: string) => {
    await supabase.from("chat_threads").delete().eq("id", id);
    setThreads((arr) => arr.filter((t) => t.id !== id));
  };

  const touchThread = async (id: string, last_message: string) => {
    await supabase.from("chat_threads").update({ last_message, updated_at: new Date().toISOString() }).eq("id", id);
    refetch();
  };

  return { threads, loading, refetch, createThread, renameThread, deleteThread, touchThread };
}

export function useThreadMessages(threadId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!threadId || !user) { setMessages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    setMessages((data as ChatMessage[]) ?? []);
    setLoading(false);
  }, [threadId, user]);

  useEffect(() => { refetch(); }, [refetch]);

  const append = async (role: "user" | "assistant", content: string) => {
    if (!threadId || !user) return;
    const { data } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId, user_id: user.id, role, content })
      .select()
      .single();
    if (data) setMessages((arr) => [...arr, data as ChatMessage]);
  };

  return { messages, loading, refetch, append, setMessages };
}
