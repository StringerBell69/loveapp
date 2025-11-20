"use client";

import { useEffect, useState } from "react";
import { differenceInDays, format, addYears } from "date-fns";
import { fr } from "date-fns/locale";
import { useCouple } from "./useCouple";

export function useDaysCounter() {
  const { couple } = useCouple();
  const [daysTogether, setDaysTogether] = useState(0);
  const [daysUntilAnniversary, setDaysUntilAnniversary] = useState<number | null>(null);
  const [nextAnniversaryDate, setNextAnniversaryDate] = useState<string | null>(null);

  useEffect(() => {
    if (!couple?.anniversary_date) return;

    const anniversaryDate = new Date(couple.anniversary_date);
    const today = new Date();

    // Calculate days together
    const days = differenceInDays(today, anniversaryDate);
    setDaysTogether(days > 0 ? days : 0);

    // Calculate next anniversary
    let nextAnniversary = new Date(
      today.getFullYear(),
      anniversaryDate.getMonth(),
      anniversaryDate.getDate()
    );

    // If anniversary has passed this year, calculate for next year
    if (nextAnniversary < today) {
      nextAnniversary = addYears(nextAnniversary, 1);
    }

    const daysUntil = differenceInDays(nextAnniversary, today);
    setDaysUntilAnniversary(daysUntil);
    setNextAnniversaryDate(format(nextAnniversary, "d MMMM yyyy", { locale: fr }));
  }, [couple]);

  const formatAnniversaryDate = () => {
    if (!couple?.anniversary_date) return null;
    return format(new Date(couple.anniversary_date), "d MMMM yyyy", { locale: fr });
  };

  return {
    daysTogether,
    daysUntilAnniversary,
    nextAnniversaryDate,
    anniversaryDate: couple?.anniversary_date,
    formatAnniversaryDate,
  };
}
