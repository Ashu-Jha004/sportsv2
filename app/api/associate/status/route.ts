import { NextResponse } from "next/server";
import { getAssociateStatus } from "@/lib/associate/get-associate-status";

export async function GET() {
  try {
    const status = await getAssociateStatus();

    if (!status.isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error("Associate status API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch associate status",
        code: "STATUS_FETCH_FAILED",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
