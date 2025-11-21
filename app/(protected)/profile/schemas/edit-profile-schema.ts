import { z } from "zod";

export enum Sport {
  FOOTBALL = "FOOTBALL",
  BASKETBALL = "BASKETBALL",
  TENNIS = "TENNIS",
  CRICKET = "CRICKET",
  SOCCER = "SOCCER",
  VOLLEYBALL = "VOLLEYBALL",
  OTHER = "OTHER",
  // ... add all your sports
}
export const editProfileSchema = z.object({
  username: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().max(500),
  primarySport: z.nativeEnum(Sport),
  secondarySports: z.array(z.nativeEnum(Sport)),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
