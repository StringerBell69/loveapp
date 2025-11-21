// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "@/src/contexts/CoupleContext";
import type { BucketListItem, NewBucketListItem } from "@/lib/db/schema";

export function useBucketList() {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { couple } = useCouple();
  const supabase = createClient();

  useEffect(() => {
    if (!couple?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchItems();
  }, [couple?.id]);

  async function fetchItems() {
    if (!couple?.id) return;

    try {
      const { data, error } = await supabase
        .from("bucket_list_items")
        .select("*")
        .eq("couple_id", couple.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data as BucketListItem[]);
    } catch (error) {
      console.error("Error fetching bucket list:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createItem(
    item: Omit<NewBucketListItem, "couple_id" | "created_by">
  ): Promise<BucketListItem | null> {
    if (!couple?.id) return null;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      const newItem = {
        ...item,
        couple_id: couple.id,
        created_by: userData.user.id,
      };

      const { data, error } = await supabase
        .from("bucket_list_items")
        .insert(newItem as any)
        .select()
        .single();

      if (error) throw error;

      setItems((prev) => [data as BucketListItem, ...prev]);
      return data as BucketListItem;
    } catch (error) {
      console.error("Error creating bucket list item:", error);
      return null;
    }
  }

  async function updateItem(
    id: string,
    updates: Partial<BucketListItem>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("bucket_list_items")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      return true;
    } catch (error) {
      console.error("Error updating bucket list item:", error);
      return false;
    }
  }

  async function deleteItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("bucket_list_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting bucket list item:", error);
      return false;
    }
  }

  async function markAsCompleted(
    id: string,
    completionData: {
      completedDate: string;
      completionPhotoUrl?: string;
      completionNote?: string;
    }
  ): Promise<boolean> {
    return updateItem(id, {
      status: "done",
      ...completionData,
    });
  }

  const getItemsByStatus = (status: "todo" | "in_progress" | "done") =>
    items.filter((item) => item.status === status);

  const getStatistics = () => {
    const total = items.length;
    const done = items.filter((item) => item.status === "done").length;
    const inProgress = items.filter((item) => item.status === "in_progress")
      .length;
    const todo = items.filter((item) => item.status === "todo").length;

    return {
      total,
      done,
      inProgress,
      todo,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  };

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    markAsCompleted,
    getItemsByStatus,
    getStatistics,
    refetch: fetchItems,
  };
}
