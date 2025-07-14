// app/api/places/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Ambil API Key dari environment variable
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Tipe hasil yang dikembalikan ke frontend (sudah termasuk phone dan website)
interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating: number | "N/A";
  user_ratings_total: number;
  types: string[];
  lat: number;
  lng: number;
  photo_reference: string | null;
  phoneNumber: string; // Tambahkan field phoneNumber
  website: string; // Tambahkan field website
}

// Tipe mentah dari API Google Places (text search)
interface RawPlaceTextSearch {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: {
    photo_reference: string;
  }[];
}

// Tipe mentah dari API Google Places (place details)
interface RawPlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: {
    photo_reference: string;
  }[];
  formatted_phone_number?: string;
  website?: string;
}

// Fungsi helper untuk menambahkan delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "point_of_interest";
  const radius = searchParams.get("radius") || "50000";
  const location = searchParams.get("location") || "-6.2088,106.8456"; // Koordinat Jakarta

  if (!query) {
    return NextResponse.json(
      { error: 'Parameter "query" diperlukan.' },
      { status: 400 }
    );
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY tidak ditemukan di .env.local");
    return NextResponse.json(
      { error: "Server API Key tidak dikonfigurasi." },
      { status: 500 }
    );
  }

  let allPlaces: RawPlaceTextSearch[] = [];
  let next_page_token: string | undefined = undefined;
  let pageCount = 0;
  const MAX_PAGES = 3; // Google Places API Text Search biasanya hanya mendukung hingga 3 halaman (60 hasil)

  try {
    do {
      let textSearchApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}&type=${type}&radius=${radius}&location=${location}`;

      if (next_page_token) {
        textSearchApiUrl += `&pagetoken=${next_page_token}`;
        // Google merekomendasikan delay saat menggunakan pagetoken
        await delay(2000); // Tunggu 2 detik sebelum permintaan halaman berikutnya
      }

      console.log(
        `Memanggil Places API (Text Search, Page ${
          pageCount + 1
        }): ${textSearchApiUrl}`
      );

      const textSearchResponse = await axios.get(textSearchApiUrl);
      const textSearchData = textSearchResponse.data;

      if (textSearchData.status === "INVALID_REQUEST" && next_page_token) {
        // Ini bisa terjadi jika pagetoken tidak valid lagi (misal, terlalu lama)
        console.warn("Invalid request with pagetoken. Stopping pagination.");
        break;
      }

      if (
        textSearchData.status !== "OK" &&
        textSearchData.status !== "ZERO_RESULTS"
      ) {
        console.error(
          "Places API Text Search error:",
          textSearchData.status,
          textSearchData.error_message
        );
        return NextResponse.json(
          {
            error:
              textSearchData.error_message ||
              "Gagal mengambil data dari Places API (Text Search).",
            status: textSearchData.status,
          },
          { status: 500 }
        );
      }

      if (textSearchData.results && textSearchData.results.length > 0) {
        allPlaces = allPlaces.concat(textSearchData.results);
      }

      next_page_token = textSearchData.next_page_token;
      pageCount++;
    } while (next_page_token && pageCount < MAX_PAGES);

    if (allPlaces.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Tidak ada hasil ditemukan.",
      });
    }

    // 2. Untuk setiap hasil dari Text Search (dari semua halaman), lakukan panggilan Place Details
    // PENTING: Melakukan panggilan Place Details untuk SETIAP hasil pencarian
    // akan secara signifikan meningkatkan biaya penggunaan Google Maps API kamu.
    // Pertimbangkan ini untuk penggunaan skala besar.
    const detailedResultsPromises = allPlaces.map(async (place) => {
      const placeDetailsApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,types,geometry,photos,formatted_phone_number,website&key=${GOOGLE_MAPS_API_KEY}`;

      try {
        const detailsResponse = await axios.get(placeDetailsApiUrl);
        const detailsData = detailsResponse.data;

        if (detailsData.status === "OK") {
          const detailedPlace: RawPlaceDetails = detailsData.result;
          return {
            place_id: detailedPlace.place_id,
            name: detailedPlace.name,
            address: detailedPlace.formatted_address,
            rating: detailedPlace.rating ?? "N/A",
            user_ratings_total: detailedPlace.user_ratings_total ?? 0,
            types: detailedPlace.types ?? [],
            lat: detailedPlace.geometry.location.lat,
            lng: detailedPlace.geometry.location.lng,
            photo_reference: detailedPlace.photos?.[0]?.photo_reference ?? null,
            phoneNumber: detailedPlace.formatted_phone_number ?? "N/A", // Tambahkan nomor telepon
            website: detailedPlace.website ?? "N/A", // Tambahkan URL situs web
          } as PlaceResult; // Cast ke PlaceResult
        } else {
          console.warn(
            `Place Details API error for ${place.place_id}:`,
            detailsData.status,
            detailsData.error_message
          );
          // Jika ada error di Place Details, kembalikan data dasar dari Text Search
          return {
            place_id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating ?? "N/A",
            user_ratings_total: place.user_ratings_total ?? 0,
            types: place.types ?? [],
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            photo_reference: place.photos?.[0]?.photo_reference ?? null,
            phoneNumber: "N/A",
            website: "N/A",
          } as PlaceResult;
        }
      } catch (detailsError) {
        const err = detailsError as Error;
        console.error(
          `Error fetching Place Details for ${place.place_id}:`,
          err.message
        );
        return {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating ?? "N/A",
          user_ratings_total: place.user_ratings_total ?? 0,
          types: place.types ?? [],
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          photo_reference: place.photos?.[0]?.photo_reference ?? null,
          phoneNumber: "N/A",
          website: "N/A",
        } as PlaceResult;
      }
    });

    const results = await Promise.all(detailedResultsPromises);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    const err = error as Error;
    console.error("Server error saat memanggil Places API:", err.message);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server.",
        details: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
