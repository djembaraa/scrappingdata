// app/api/scrape/route.ts

// PENTING: Kode ini hanya untuk tujuan pendidikan dan pemahaman teknis.
// Melakukan scraping pada Google Maps dapat melanggar Syarat & Ketentuan Google
// dan berisiko pemblokiran IP atau tindakan hukum.
// Solusi yang direkomendasikan adalah menggunakan Google Maps Platform APIs resmi.

import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface PlaceResult {
  name: string;
  address: string;
  rating: number | "N/A";
  reviewCount: string | "N/A";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: 'Parameter "query" diperlukan.' },
      { status: 400 }
    );
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      query
    )}`;
    console.log(`Navigating to: ${mapsUrl}`);

    await page.goto(mapsUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    try {
      await page.waitForSelector(".hfpxzc", { timeout: 15000 });
    } catch {
      console.error(
        "Selector '.hfpxzc' tidak ditemukan dalam waktu yang ditentukan. Mungkin tidak ada hasil atau struktur HTML berubah."
      );
      return NextResponse.json({
        success: true,
        data: [],
        message: "Tidak ada hasil ditemukan atau selector berubah.",
      });
    }

    // Scroll untuk load lebih banyak hasil (jika ada)
    await page.evaluate(async () => {
      const scrollableSection = document.querySelector('[role="feed"]');
      if (scrollableSection) {
        let lastHeight = scrollableSection.scrollHeight;
        while (true) {
          scrollableSection.scrollBy(0, scrollableSection.scrollHeight);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const newHeight = scrollableSection.scrollHeight;
          if (newHeight === lastHeight) break;
          lastHeight = newHeight;
        }
      }
    });

    const data: PlaceResult[] = await page.evaluate(() => {
      const results: PlaceResult[] = [];

      document.querySelectorAll(".hfpxzc").forEach((el) => {
        const nameElement = el.querySelector(".fontHeadlineSmall");
        const addressElement = el.querySelector(
          ".W4Efsd:nth-child(2) > span:nth-child(2)"
        );
        const ratingTextElement = el.querySelector(".g88MCb");
        const reviewCountElement = el.querySelector(".UY7F9b");

        const name = nameElement?.textContent?.trim();
        const address = addressElement?.textContent?.trim();
        const ratingText = ratingTextElement
          ?.getAttribute("aria-label")
          ?.trim();
        const reviewCount = reviewCountElement?.textContent
          ?.replace(/[()]/g, "")
          .trim();

        if (name) {
          results.push({
            name,
            address: address || "N/A",
            rating: ratingText ? parseFloat(ratingText.split(" ")[0]) : "N/A",
            reviewCount: reviewCount || "N/A",
          });
        }
      });

      return results;
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Scraping error:", error);
    const err = error as Error;

    return NextResponse.json(
      {
        error: "Gagal melakukan scraping",
        details: err.message || "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
