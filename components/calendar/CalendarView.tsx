"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface CalendarViewProps {
  events: Event[];
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
}

export function CalendarView({
  events,
  onDateClick,
  selectedDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.event_date === dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const today = new Date();

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="gradient-love-subtle p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            className="hover:bg-white/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <h2 className="text-xl font-bold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="hover:bg-white/30"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
            <div
              key={i}
              className="text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <motion.button
                key={i}
                onClick={() => onDateClick(day)}
                className={cn(
                  "aspect-square p-1 rounded-lg text-sm relative transition-all",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isToday && "bg-primary/10 font-bold",
                  isSelected && "bg-primary text-white",
                  "hover:bg-accent active:scale-95"
                )}
                whileTap={{ scale: 0.9 }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{format(day, "d")}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={idx}
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
