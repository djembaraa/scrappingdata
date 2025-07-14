// app/page.tsx

"use client";

import { useState } from "react";
import axios from "axios";

interface PlaceResult {
  place_id: string;
  name: string;
  address: string;
  rating: number | string;
  user_ratings_total: number;
  types: string[];
  lat: number;
  lng: number;
  photo_reference: string | null;
  phoneNumber: string;
  website: string;
  email: string; // ✅ Tambahan
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    if (!query.trim()) {
      setError("Masukkan kata kunci pencarian.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `/api/places?query=${encodeURIComponent(query)}`
      );
      if (response.data.success) {
        const withEmail: PlaceResult[] = response.data.data.map(
          (item: Omit<PlaceResult, "email">) => ({
            ...item,
            email: "N/A",
          })
        );
        setResults(withEmail);
      } else {
        setError(
          response.data.error || "Terjadi kesalahan saat mengambil data."
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.details || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal terhubung ke server API.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoReference: string | null) => {
    if (!photoReference) {
      return "https://placehold.co/150x100/E0E0E0/888888?text=No+Image";
    }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set for photo URL."
      );
      return "https://placehold.co/150x100/E0E0E0/888888?text=API+Key+Missing";
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
  };

  const exportToCsv = () => {
    if (results.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    const headers = [
      "Nama Tempat",
      "Alamat",
      "Rating",
      "Total Ulasan",
      "Tipe",
      "Latitude",
      "Longitude",
      "Nomor Telepon",
      "Situs Web",
      "Email",
      "ID Tempat",
      "URL Foto",
    ];

    const csvRows = [
      headers.join(","),
      ...results.map((row) =>
        [
          `"${row.name.replace(/"/g, '""')}"`,
          `"${row.address.replace(/"/g, '""')}"`,
          row.rating,
          row.user_ratings_total,
          `"${row.types.join(", ").replace(/"/g, '""')}"`,
          row.lat,
          row.lng,
          `"${row.phoneNumber.replace(/"/g, '""')}"`,
          `"${row.website.replace(/"/g, '""')}"`,
          `"${row.email.replace(/"/g, '""')}"`,
          row.place_id,
          row.photo_reference
            ? `"${getPhotoUrl(row.photo_reference).replace(/"/g, '""')}"`
            : "",
        ].join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "google_places_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Cari Tempat dengan Google Maps Places API
        </h1>
        <p className="text-sm text-green-700 text-center mb-6">
          Menggunakan{" "}
          <strong className="font-semibold">
            Google Maps Platform APIs resmi
          </strong>{" "}
          adalah cara yang direkomendasikan dan aman untuk mendapatkan data
          lokasi.
        </p>
        <p className="text-sm text-orange-600 text-center mb-6 font-semibold">
          PENTING: Fitur nomor telepon dan situs web ini membutuhkan panggilan
          API tambahan (Place Details), yang dapat{" "}
          <strong className="underline">
            meningkatkan biaya penggunaan Google Maps API Anda
          </strong>
          .
        </p>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tempat (misal: 'restoran jakarta')"
            className="flex-grow p-3 border text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Mencari..." : "Cari Data"}
          </button>
        </form>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-600 mb-6">
            <p>Memuat data dari Google Places API...</p>
            <div className="mt-2 animate-pulse text-blue-500">
              <svg
                className="inline w-6 h-6 mr-2 text-blue-500 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sedang mengambil data...
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Hasil Pencarian ({results.length} ditemukan):
            </h2>
            <button
              onClick={exportToCsv}
              className="bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700 transition-colors duration-200 mb-6"
            >
              Download as CSV
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <div
                  key={item.place_id}
                  className="bg-gray-50 p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col"
                >
                  <img
                    src={getPhotoUrl(item.photo_reference)}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/150x100/E0E0E0/888888?text=No+Image";
                    }}
                  />
                  <h3 className="text-xl font-bold text-blue-700 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-semibold">Alamat:</span>{" "}
                    {item.address}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-semibold">Rating:</span> {item.rating}{" "}
                    ⭐ ({item.user_ratings_total} ulasan)
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-semibold">Telepon:</span>{" "}
                    {item.phoneNumber}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <span className="font-semibold">Situs Web:</span>{" "}
                    {item.website !== "N/A" ? (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {item.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Tipe:</span>{" "}
                    {item.types.join(", ")}
                  </p>
                  {/* Email tidak ditampilkan di UI */}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && !error && query && (
          <div className="text-center text-gray-600 mt-8">
            <p>
              Tidak ada hasil ditemukan untuk &quot;{query}&quot;. Coba kata
              kunci lain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
