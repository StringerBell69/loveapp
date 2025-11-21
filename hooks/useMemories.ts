// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "./useCouple";
import type { Memory, NewMemory } from "@/lib/db/schema";

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { couple } = useCouple();
  const supabase = createClient();

  // Fetch memories
  useEffect(() => {
    if (!couple?.id) {
      setMemories([]);
      setLoading(false);
      return;
    }

    fetchMemories();
  }, [couple?.id]);

  async function fetchMemories() {
    if (!couple?.id) return;

    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("couple_id", couple.id)
        .order("memory_date", { ascending: false });

      if (error) throw error;

      setMemories(data as Memory[]);
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  }

  // Create memory
  async function createMemory(
    memory: Omit<NewMemory, "couple_id" | "created_by">
  ): Promise<Memory | null> {
    if (!couple?.id) return null;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const newMemory = {
        ...memory,
        couple_id: couple.id,
        created_by: userData.user.id,
      };

      const { data, error } = await supabase
        .from("memories")
        .insert(newMemory as any)
        .select()
        .single();

      if (error) throw error;

      setMemories((prev) => [data as Memory, ...prev]);
      return data as Memory;
    } catch (error) {
      console.error("Error creating memory:", error);
      return null;
    }
  }

  // Update memory
  async function updateMemory(
    id: string,
    updates: Partial<Memory>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("memories")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;

      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );

      return true;
    } catch (error) {
      console.error("Error updating memory:", error);
      return false;
    }
  }

  // Delete memory
  async function deleteMemory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("memories").delete().eq("id", id);

      if (error) throw error;

      setMemories((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting memory:", error);
      return false;
    }
  }

  // Get memory by ID
  async function getMemoryById(id: string): Promise<Memory | null> {
    try {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Memory;
    } catch (error) {
      console.error("Error fetching memory:", error);
      return null;
    }
  }

  // Get memories by date
  function getMemoriesByDate(date: Date): Memory[] {
    const dateStr = date.toISOString().split("T")[0];
    return memories.filter((m) => m.memoryDate === dateStr);
  }

  // Get memories by month/year
  function getMemoriesByMonth(year: number, month: number): Memory[] {
    return memories.filter((m) => {
      const memoryDate = new Date(m.memoryDate);
      return (
        memoryDate.getFullYear() === year && memoryDate.getMonth() === month
      );
    });
  }

  return {
    memories,
    loading,
    createMemory,
    updateMemory,
    deleteMemory,
    getMemoryById,
    getMemoriesByDate,
    getMemoriesByMonth,
    refetch: fetchMemories,
  };
}
