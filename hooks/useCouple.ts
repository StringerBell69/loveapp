// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import { useAuth } from "./useAuth";

type Couple = Database["public"]["Tables"]["couples"]["Row"];
type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export function useCouple() {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCoupleData = async () => {
      try {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData as UserProfile);

        if ((profileData as UserProfile)?.couple_id) {
          // Get couple data
          const { data: coupleData, error: coupleError } = await supabase
            .from("couples")
            .select("*")
            .eq("id", (profileData as UserProfile).couple_id!)
            .single();

          if (coupleError) throw coupleError;
          setCouple(coupleData as Couple);

          // Get partner profile
          const { data: partnerData, error: partnerError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("couple_id", (profileData as UserProfile).couple_id!)
            .neq("id", user.id)
            .single();

          if (!partnerError && partnerData) {
            setPartnerProfile(partnerData as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching couple data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupleData();
  }, [user, supabase]);

  const createCouple = async (anniversaryDate?: string): Promise<Couple> => {
    if (!user) throw new Error("User not authenticated");

    // Generate couple code
    const { data: codeData, error: codeError } = await supabase.rpc(
      "generate_couple_code"
    );

    if (codeError) throw codeError;
    if (!codeData) throw new Error("Failed to generate couple code");

    // Create couple
    const { data: coupleData, error: coupleError } = await supabase
      .from("couples")
      .insert({
        couple_code: codeData as string,
        anniversary_date: anniversaryDate || null,
      } as any)
      .select()
      .single();

    if (coupleError) throw coupleError;
    if (!coupleData) throw new Error("Failed to create couple");

    // Update user profile
    // @ts-ignore - Supabase type inference issue
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ couple_id: coupleData.id })
      .eq("id", user.id);

    if (profileError) throw profileError;

    setCouple(coupleData as Couple);
    return coupleData as Couple;
  };

  const joinCouple = async (coupleCode: string): Promise<Couple> => {
    if (!user) throw new Error("User not authenticated");

    // Find couple by code
    const { data: coupleData, error: coupleError } = await supabase
      .from("couples")
      .select("*")
      .eq("couple_code", coupleCode.toUpperCase())
      .single();

    if (coupleError) throw new Error("Code de couple invalide");

    // Check if couple already has 2 members
    const { data: members, error: membersError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("couple_id", coupleData.id);

    if (membersError) throw membersError;
    if (members.length >= 2) {
      throw new Error("Ce couple a déjà 2 membres");
    }

    // Update user profile
    // @ts-ignore - Supabase type inference issue
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ couple_id: coupleData.id })
      .eq("id", user.id);

    if (profileError) throw profileError;

    setCouple(coupleData as Couple);
    return coupleData as Couple;
  };

  const updateCouple = async (anniversaryDate?: string): Promise<Couple> => {
    if (!couple) throw new Error("No couple found");

    const { data, error } = await supabase
      .from("couples")
      .update({ anniversary_date: anniversaryDate || null })
      .eq("id", couple.id)
      .select()
      .single();

    if (error) throw error;
    setCouple(data);
    return data;
  };

  const leaveCouple = async () => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("user_profiles")
      .update({ couple_id: null })
      .eq("id", user.id);

    if (error) throw error;

    setCouple(null);
    setPartnerProfile(null);
  };

  return {
    couple,
    profile,
    partnerProfile,
    loading,
    createCouple,
    joinCouple,
    updateCouple,
    leaveCouple,
  };
}
