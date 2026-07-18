// app/api/upload/video/route.js
import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getCurrentUser } from "@/lib/session";

const BLOB_TOKEN = "vercel_blob_rw_K4GLVfEM16jdfLfG_bMRHipNhlssOXsR8c8kCjEgG9tO0n0";

export async function POST(request) {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: BLOB_TOKEN,
      onBeforeGenerateToken: async () => {
        // Defense in depth: middleware already blocks non-admins from
        // reaching this route, but we check again here since this route
        // hands out an upload token — never skip auth before minting one.
        const user = await getCurrentUser();
        if (!user || user.role !== "admin") {
          throw new Error("Khusus admin yang boleh upload.");
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
          addRandomSuffix: true,
          maximumSizeInBytes: 3 * 1024 * 1024 * 1024, // 3GB ceiling, adjust to your plan
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do here — the browser saves movie metadata itself
        // via POST /api/movies right after this upload resolves.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
