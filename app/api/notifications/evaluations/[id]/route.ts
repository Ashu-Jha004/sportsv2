// src/app/api/evaluations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEvaluationRequestDetailsServer } from "@/server/notifications/client/evaluations/server/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const details = await fetchEvaluationRequestDetailsServer(id);
    return NextResponse.json({ ok: true, data: details }, { status: 200 });
  } catch (error: any) {
    console.error("[api/evaluations/[id]] GET failed", {
      error,
      id,
    });

    const status =
      error?.code === "AUTH_UNAUTHENTICATED"
        ? 401
        : error?.code === "FORBIDDEN"
        ? 403
        : error?.code === "REQUEST_NOT_FOUND"
        ? 404
        : 500;

    return NextResponse.json(
      {
        ok: false,
        errorCode: error?.code ?? "EVAL_DETAILS_FETCH_FAILED",
        errorMessage:
          process.env.NODE_ENV === "development"
            ? error?.message ?? "Failed to fetch evaluation details"
            : "Unable to load evaluation details right now.",
      },
      { status }
    );
  }
}
