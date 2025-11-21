// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import { useCouple } from "@/src/contexts/CoupleContext";

type Event = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { couple } = useCouple();
  const supabase = createClient();

  useEffect(() => {
    if (!couple) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("couple_id", couple.id)
          .order("event_date", { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `couple_id=eq.${couple.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvents((prev) => [...prev, payload.new as Event]);
          } else if (payload.eventType === "UPDATE") {
            setEvents((prev) =>
              prev.map((event) =>
                event.id === payload.new.id ? (payload.new as Event) : event
              )
            );
          } else if (payload.eventType === "DELETE") {
            setEvents((prev) =>
              prev.filter((event) => event.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple, supabase]);

  const createEvent = async (event: Omit<EventInsert, "couple_id" | "created_by">) => {
    if (!couple) throw new Error("No couple found");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("events")
      .insert({
        ...event,
        couple_id: couple.id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateEvent = async (id: string, event: EventUpdate) => {
    const { data, error } = await supabase
      .from("events")
      .update(event)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;
  };

  const getUpcomingEvents = (limit: number = 3) => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((event) => event.event_date >= today)
      .slice(0, limit);
  };

  const getEventsByDate = (date: string) => {
    return events.filter((event) => event.event_date === date);
  };

  const getEventsByMonth = (year: number, month: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.event_date);
      return (
        eventDate.getFullYear() === year && eventDate.getMonth() === month
      );
    });
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    getEventsByDate,
    getEventsByMonth,
  };
}
