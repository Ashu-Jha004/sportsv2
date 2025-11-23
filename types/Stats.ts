type InjuryDto = {
  id: string;
  type: string;
  bodyPart: string;
  severity: string;
  occurredAt: string; // ISO
  status: string;
};

type StrengthSliceDto = {
  muscleMass: number; // 0-100
  enduranceStrength: number; // 0-100
  explosivePower: number; // 0-100
};

type SpeedSliceDto = {
  sprintSpeed: number; // normalized 0-100
  agility: number; // 0-100
};

type StaminaSliceDto = {
  cardiovascularFitness: number; // 0-100
  recoveryEfficiency: number; // 0-100
  overallFlexibility: number; // 0-100
};

type AthleteStatsResponse = {
  hasStats: boolean;
  strength: number;
  speed: number;
  agility: number;
  endurance: number;
  power: number;
  flexibility: number;
  injuries: InjuryDto[];
  strengthSlice: StrengthSliceDto | null;
  speedSlice: SpeedSliceDto | null;
  staminaSlice: StaminaSliceDto | null;
};

type GuideSummary = {
  id: string;
  username: string;
  fullName: string | null;
  rank: "KING" | "QUEEN" | "ROOK" | "BISHOP" | "KNIGHT" | "PAWN";
  class: "A" | "B" | "C" | "D" | "E";
  primarySport: string | null;
  sports: string[]; // from Guide.Sports
  experienceYears: number | null;
  reviewNote: string | null;
  distanceKm: number | null;   // computed from lat/lon using earthdistance
  city: string | null;
  country: string | null;
  status: "pending_review" | "approved" | "rejected";
};

// POST /api/guides/nearest
type NearestGuidesRequest = {
  athleteLat: number;
  athleteLon: number;
  sportFilter?: "primary" | "secondary" | "all";
  username?: string;  // if provided, narrows to that guide
  maxDistanceKm?: number; // default e.g. 50
  limit?: number; // default e.g. 20
};

type NearestGuidesResponse = {
  guides: GuideSummary[];
};

type CreateEvaluationRequestInput = {
  guideId: string;
  athleteId: string;           // derived from session, not trusted from client
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  message?: string | null;
};

type CreateEvaluationRequestResult = {
  requestId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
};
