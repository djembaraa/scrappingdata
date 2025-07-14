"use client";

import { useState } from "react";
import axios from "axios";
import Head from "next/head"; // untuk metadata SEO

interface PlaceResult {
  name: string;
  address: string;
  rating: number | "N/A";
  reviewCount: string | "N/A";
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
        `/api/scrape?query=${encodeURIComponent(query)}`
      );

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(
          response.data.error || "Terjadi kesalahan saat mengambil data."
        );
      }
    } catch (err: unknown) {
      const error = err as Error & {
        response?: { data?: { details?: string } };
      };
      console.error("Frontend fetch error:", error);
      setError(
        error.response?.data?.details ||
          error.message ||
          "Gagal terhubung ke server API."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 font-inter">
      <Head>
        <title>Google Maps Scraper</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Google Maps Scraper (Eksperimental)
        </h1>
        <p className="text-sm text-red-600 text-center mb-6">
          <strong className="font-semibold">Peringatan:</strong> Melakukan
          scraping langsung pada Google Maps dapat melanggar Syarat & Ketentuan
          Google dan berisiko pemblokiran IP. Gunakan dengan sangat hati-hati
          dan hanya untuk tujuan pendidikan/penelitian. Gunakan{" "}
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google Maps Platform APIs resmi
          </a>
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
            placeholder="Contoh: restoran jakarta / hotel bandung"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <p>
              Memuat data... Ini mungkin memakan waktu beberapa saat karena
              proses scraping.
            </p>
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sedang mengambil data dari Google Maps...
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Hasil Pencarian ({results.length} ditemukan):
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-xl font-bold text-blue-700 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Alamat:</span>{" "}
                    {item.address}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Rating:</span> {item.rating}{" "}
                    ⭐
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Ulasan:</span>{" "}
                    {item.reviewCount}
                  </p>
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
