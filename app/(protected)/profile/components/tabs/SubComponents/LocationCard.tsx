// components/profile/about/LocationCard.tsx

"use client";

import { Location } from "../../../types/profile.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Globe } from "lucide-react";

interface LocationCardProps {
  city: string;
  state: string;
  country: string;
  longitude: number | undefined;
  latitude: number | undefined;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="shrink-0 mt-0.5 text-slate-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-base font-semibold text-slate-900 wrap-break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

export function LocationCard({
  city,
  country,
  state,
  longitude,
  latitude,
}: LocationCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <InfoRow
          icon={<MapPin className="w-5 h-5" />}
          label="City"
          value={city}
        />

        <InfoRow
          icon={<Globe className="w-5 h-5" />}
          label="State"
          value={state}
        />

        <InfoRow
          icon={<Globe className="w-5 h-5" />}
          label="Country"
          value={country}
        />

        {latitude && longitude && (
          <>
            <InfoRow
              icon={<Navigation className="w-5 h-5" />}
              label="Latitude"
              value={latitude.toFixed(4)}
            />

            <InfoRow
              icon={<Navigation className="w-5 h-5" />}
              label="Longitude"
              value={longitude.toFixed(4)}
            />

            {/* Google Maps Link */}
            <div className="pt-3">
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <MapPin className="w-4 h-4" />
                View on Google Maps
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
