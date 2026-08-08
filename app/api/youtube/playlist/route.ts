import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const YOUTUBE_API_URL =
  "https://www.googleapis.com/youtube/v3/playlistItems";

const MAX_RESULTS_PER_REQUEST = 50;

// Defensive limit.
// Prevents an unexpectedly huge playlist from causing
// an excessive number of YouTube API requests.
const MAX_VIDEOS = 500;

export async function GET(
  request: NextRequest
) {
  try {
    const playlistId =
      request.nextUrl.searchParams.get(
        "playlistId"
      );

    if (!playlistId) {
      return NextResponse.json(
        {
          error: "Playlist ID is required.",
        },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.YOUTUBE_DATA_API_KEY;

    if (!apiKey) {
      console.error(
        "YOUTUBE_DATA_API_KEY is missing."
      );

      return NextResponse.json(
        {
          error:
            "YouTube API key is not configured.",
        },
        { status: 500 }
      );
    }

    const videos: {
      videoId: string;
      title: string;
      description: string;
      position: number;
      thumbnail: string;
    }[] = [];

    let nextPageToken: string | null =
      null;

    let requestCount = 0;

    do {
      requestCount++;

      const apiUrl =
        new URL(YOUTUBE_API_URL);

      apiUrl.searchParams.set(
        "part",
        "snippet,contentDetails"
      );

      apiUrl.searchParams.set(
        "playlistId",
        playlistId
      );

      apiUrl.searchParams.set(
        "maxResults",
        String(
          MAX_RESULTS_PER_REQUEST
        )
      );

      apiUrl.searchParams.set(
        "key",
        apiKey
      );

      if (nextPageToken) {
        apiUrl.searchParams.set(
          "pageToken",
          nextPageToken
        );
      }

      console.log(
        `YouTube API: fetching playlist page ${requestCount}`
      );

      const response =
        await fetch(
          apiUrl.toString(),
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        );

      const text =
        await response.text();

      console.log(
        "YouTube API status:",
        response.status
      );

      if (!response.ok) {
        console.error(
          "YouTube API response:",
          text
        );

        return NextResponse.json(
          {
            error:
              "YouTube API request failed.",
            status:
              response.status,
            details: text,
          },
          {
            status:
              response.status,
          }
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "YouTube API returned invalid JSON:",
          text
        );

        return NextResponse.json(
          {
            error:
              "YouTube API returned invalid data.",
          },
          { status: 502 }
        );
      }

      const pageVideos =
        (data.items ?? []).map(
          (item: any) => ({
            videoId:
              item.contentDetails
                ?.videoId ?? "",

            title:
              item.snippet?.title ??
              "Untitled video",

            description:
              item.snippet
                ?.description ?? "",

            position:
              item.snippet
                ?.position ?? 0,

            thumbnail:
              item.snippet
                ?.thumbnails?.medium
                ?.url ??
              item.snippet
                ?.thumbnails?.default
                ?.url ??
              "",
          })
        );

      videos.push(
        ...pageVideos
      );

      nextPageToken =
        data.nextPageToken ??
        null;

      console.log(
        `YouTube API: received ${pageVideos.length} videos`
      );

      console.log(
        `YouTube API: total videos so far ${videos.length}`
      );

      if (
        videos.length >=
        MAX_VIDEOS
      ) {
        console.log(
          `YouTube API: reached safety limit of ${MAX_VIDEOS} videos`
        );

        break;
      }
    } while (nextPageToken);

    const finalVideos =
      videos.slice(
        0,
        MAX_VIDEOS
      );

    return NextResponse.json({
      playlistId,

      videos: finalVideos,

      totalResults:
        finalVideos.length,

      truncated:
        videos.length >=
        MAX_VIDEOS,

      pagesFetched:
        requestCount,
    });
  } catch (error) {
    console.error(
      "YouTube playlist route failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to fetch YouTube playlist.",
      },
      { status: 500 }
    );
  }
}