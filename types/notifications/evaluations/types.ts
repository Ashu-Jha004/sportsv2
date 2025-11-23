// src/types/evaluations/types.ts
export type PhysicalEvaluationRequestDetailsDto = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  messageFromAthlete: string | null;
  messageFromGuide: string | null;
  scheduledDate: string | null; // ISO
  scheduledTime: string | null;
  location: string | null;
  equipment: string[];
  otp: number | null;
  athlete: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  guide: {
    id: string;
    username: string | null;
    fullName: string;
  };
};
