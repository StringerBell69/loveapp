// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useCouple } from "./useCouple";
import { useAuth } from "./useAuth";
import type { Ritual, NewRitual, RitualCompletion } from "@/lib/db/schema";

export function useRituals() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [completions, setCompletions] = useState<RitualCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const { couple } = useCouple();
  const { user } = useAuth();
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!couple?.id) {
      setRituals([]);
      setLoading(false);
      return;
    }

    fetchRituals();
    fetchCompletions();
  }, [couple?.id]);

  async function fetchRituals() {
    if (!couple?.id) return;

    try {
      const { data, error } = await supabase
        .from("rituals")
        .select("*")
        .eq("couple_id", couple.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRituals(data as Ritual[]);
    } catch (error) {
      console.error("Error fetching rituals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompletions() {
    if (!couple?.id) return;

    try {
      // Get all ritual IDs
      const { data: ritualsData } = await supabase
        .from("rituals")
        .select("id")
        .eq("couple_id", couple.id);

      if (!ritualsData || ritualsData.length === 0) return;

      const ritualIds = ritualsData.map((r) => r.id);

      const { data, error } = await supabase
        .from("ritual_completions")
        .select("*")
        .in("ritual_id", ritualIds)
        .order("completed_date", { ascending: false });

      if (error) throw error;

      setCompletions(data as RitualCompletion[]);
    } catch (error) {
      console.error("Error fetching completions:", error);
    }
  }

  async function createRitual(
    ritual: Omit<NewRitual, "couple_id" | "created_by">
  ): Promise<Ritual | null> {
    if (!couple?.id || !user?.id) return null;

    try {
      const newRitual = {
        ...ritual,
        couple_id: couple.id,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("rituals")
        .insert(newRitual as any)
        .select()
        .single();

      if (error) throw error;

      setRituals((prev) => [data as Ritual, ...prev]);
      return data as Ritual;
    } catch (error) {
      console.error("Error creating ritual:", error);
      return null;
    }
  }

  async function updateRitual(
    id: string,
    updates: Partial<Ritual>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("rituals")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;

      setRituals((prev) =>
        prev.map((ritual) =>
          ritual.id === id ? { ...ritual, ...updates } : ritual
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating ritual:", error);
      return false;
    }
  }

  async function deleteRitual(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("rituals").delete().eq("id", id);

      if (error) throw error;

      setRituals((prev) => prev.filter((ritual) => ritual.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting ritual:", error);
      return false;
    }
  }

  async function markAsComplete(
    ritualId: string,
    note?: string
  ): Promise<boolean> {
    if (!user?.id) return false;

    try {
      const today = new Date().toISOString().split("T")[0];

      // Check if already completed today
      const existing = completions.find(
        (c) => c.ritualId === ritualId && c.completedDate === today
      );

      if (existing) {
        console.log("Ritual already completed today");
        return false;
      }

      const completion = {
        ritual_id: ritualId,
        completed_by: user.id,
        completed_date: today,
        note: note || null,
      };

      const { data, error } = await supabase
        .from("ritual_completions")
        .insert(completion as any)
        .select()
        .single();

      if (error) throw error;

      setCompletions((prev) => [data as RitualCompletion, ...prev]);

      // Refresh rituals to get updated streak
      await fetchRituals();

      return true;
    } catch (error) {
      console.error("Error marking ritual as complete:", error);
      return false;
    }
  }

  async function removeCompletion(completionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("ritual_completions")
        .delete()
        .eq("id", completionId);

      if (error) throw error;

      setCompletions((prev) => prev.filter((c) => c.id !== completionId));

      // Refresh rituals to get updated streak
      await fetchRituals();

      return true;
    } catch (error) {
      console.error("Error removing completion:", error);
      return false;
    }
  }

  const isCompletedToday = (ritualId: string): boolean => {
    const today = new Date().toISOString().split("T")[0];
    return completions.some(
      (c) => c.ritualId === ritualId && c.completedDate === today
    );
  };

  const getCompletionsForRitual = (ritualId: string): RitualCompletion[] => {
    return completions
      .filter((c) => c.ritualId === ritualId)
      .sort(
        (a, b) =>
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime()
      );
  };

  return {
    rituals,
    completions,
    loading,
    createRitual,
    updateRitual,
    deleteRitual,
    markAsComplete,
    removeCompletion,
    isCompletedToday,
    getCompletionsForRitual,
    refetch: fetchRituals,
  };
}
