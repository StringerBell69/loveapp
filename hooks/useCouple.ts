// @ts-nocheck
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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

  // Create supabase client once using useMemo
  const supabase = useMemo(() => createClient(), []);

  const fetchCoupleData = useCallback(async () => {
    console.log('🔄 fetchCoupleData called, user:', user?.id);

    if (!user) {
      console.log('❌ No user, clearing state');
      setCouple(null);
      setProfile(null);
      setPartnerProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile error:', profileError);
        throw profileError;
      }

      console.log('✅ Got profile:', {
        id: profileData.id,
        couple_id: (profileData as UserProfile)?.couple_id
      });

      if ((profileData as UserProfile)?.couple_id) {
        console.log('📍 Fetching couple...');

        // Get couple data
        const { data: coupleData, error: coupleError } = await supabase
          .from("couples")
          .select("*")
          .eq("id", (profileData as UserProfile).couple_id!)
          .single();

        if (coupleError) {
          console.log('❌ Couple error:', coupleError);
          throw coupleError;
        }

        console.log('✅ Got couple:', coupleData?.id);

        // Get partner profile
        const { data: partnerData, error: partnerError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("couple_id", (profileData as UserProfile).couple_id!)
          .neq("id", user.id)
          .single();

        // Update all state together before setting loading to false
        console.log('✅ Setting couple state');
        setProfile(profileData as UserProfile);
        setCouple(coupleData as Couple);
        setPartnerProfile(partnerError ? null : (partnerData as UserProfile));
        setLoading(false);
      } else {
        // No couple - update all state together
        console.log('⚠️ No couple_id on profile');
        setProfile(profileData as UserProfile);
        setCouple(null);
        setPartnerProfile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching couple data:", error);
      // On error, clear everything
      setProfile(null);
      setCouple(null);
      setPartnerProfile(null);
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchCoupleData();
  }, [fetchCoupleData]); // Depend on fetchCoupleData which depends on user and supabase

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
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ couple_id: coupleData.id })
      .eq("id", user.id);

    if (profileError) throw profileError;

    // Refresh all couple data from database
    await fetchCoupleData();

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
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ couple_id: coupleData.id })
      .eq("id", user.id);

    if (profileError) throw profileError;

    // Refresh all couple data from database
    await fetchCoupleData();

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
    partner: partnerProfile, // Alias for consistency
    partnerProfile,
    loading,
    createCouple,
    joinCouple,
    updateCouple,
    leaveCouple,
    refresh: fetchCoupleData,
  };
}
