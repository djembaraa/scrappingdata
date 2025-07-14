// app/layout.tsx

import "./globals.css"; // Pastikan ini ada untuk Tailwind CSS

export const metadata = {
  title: "Google Maps Places API App",
  description:
    "A Next.js application to search places using Google Maps Places API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Link untuk font Inter */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
