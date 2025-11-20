import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Couple validations
export const createCoupleSchema = z.object({
  anniversaryDate: z.string().optional(),
});

export const joinCoupleSchema = z.object({
  coupleCode: z.string().length(6, "Le code doit contenir 6 caractères").toUpperCase(),
});

export const updateCoupleSchema = z.object({
  anniversaryDate: z.string().optional(),
});

// Event validations
export const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255, "Le titre est trop long"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "La date est requise"),
  eventTime: z.string().optional(),
  eventType: z.enum(["date", "anniversary", "todo"]),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur invalide"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;
export type JoinCoupleInput = z.infer<typeof joinCoupleSchema>;
export type UpdateCoupleInput = z.infer<typeof updateCoupleSchema>;
export type EventInput = z.infer<typeof eventSchema>;
