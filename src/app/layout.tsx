import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arkiv Analytics Dashboard",
  description: "Real-time analytics for Aave protocol events on Arkiv Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold">Arkiv Analytics</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="https://explorer.mendoza.hoodi.arkiv.network/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Explorer
                </a>
                <a
                  href="https://arkiv.network/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Docs
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
