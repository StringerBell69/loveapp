// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCouple } from "@/src/contexts/CoupleContext";
import { useAuth } from "./useAuth";
import type { WishlistItem, NewWishlistItem } from "@/lib/db/schema";

export function useWishlist() {
  const [myItems, setMyItems] = useState<WishlistItem[]>([]);
  const [partnerItems, setPartnerItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { couple, partner } = useCouple();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!couple?.id || !user?.id) {
      setMyItems([]);
      setPartnerItems([]);
      setLoading(false);
      return;
    }

    fetchWishlists();
  }, [couple?.id, user?.id]);

  async function fetchWishlists() {
    if (!couple?.id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("couple_id", couple.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allItems = data as WishlistItem[];

      // Separate my items and partner's items
      const mine = allItems.filter((item) => item.userId === user.id);
      const partners = allItems.filter((item) => item.userId !== user.id);

      setMyItems(mine);
      setPartnerItems(partners);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createItem(
    item: Omit<NewWishlistItem, "couple_id" | "user_id">
  ): Promise<WishlistItem | null> {
    if (!couple?.id || !user?.id) return null;

    try {
      const newItem = {
        ...item,
        couple_id: couple.id,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("wishlist_items")
        .insert(newItem as any)
        .select()
        .single();

      if (error) throw error;

      setMyItems((prev) => [data as WishlistItem, ...prev]);
      return data as WishlistItem;
    } catch (error) {
      console.error("Error creating wishlist item:", error);
      return null;
    }
  }

  async function updateItem(
    id: string,
    updates: Partial<WishlistItem>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .update(updates as any)
        .eq("id", id);

      if (error) throw error;

      // Update in appropriate list
      setMyItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      setPartnerItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      return true;
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      return false;
    }
  }

  async function deleteItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMyItems((prev) => prev.filter((item) => item.id !== id));
      setPartnerItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      return false;
    }
  }

  async function togglePurchased(
    id: string,
    purchased: boolean
  ): Promise<boolean> {
    if (!user?.id) return false;

    try {
      const updates: any = {
        is_purchased: purchased,
      };

      if (purchased) {
        updates.purchased_by = user.id;
        updates.purchased_date = new Date().toISOString().split("T")[0];
      } else {
        updates.purchased_by = null;
        updates.purchased_date = null;
      }

      const { error } = await supabase
        .from("wishlist_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      // Update partner items (this is where the purchase status is tracked)
      setPartnerItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );

      return true;
    } catch (error) {
      console.error("Error toggling purchase status:", error);
      return false;
    }
  }

  // Check if current user has marked an item as purchased
  const isPurchasedByMe = (item: WishlistItem): boolean => {
    return item.isPurchased && item.purchasedBy === user?.id;
  };

  return {
    myItems,
    partnerItems,
    loading,
    createItem,
    updateItem,
    deleteItem,
    togglePurchased,
    isPurchasedByMe,
    refetch: fetchWishlists,
  };
}
