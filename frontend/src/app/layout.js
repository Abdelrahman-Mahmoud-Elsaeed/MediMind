import { Cairo, Inter } from "next/font/google";
import { ThemeProvider } from "./providers";
import { I18nProvider } from "@/shared/i18n/I18nProvider";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata = {
  title: "وفاء | إدارة الأدوية ومتابعة المرضى",
  description: "منصة وفاء — منصة متكاملة لإدارة الأدوية ومتابعة المرضى المزمنين في الوطن العربي",
  manifest: "/manifest.json",
  themeColor: "#0EA5E9",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: ["/icon-192.png"]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "وفاء"
  }
};

export const viewport = {
  themeColor: "#0EA5E9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="وفاء" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${cairo.variable} ${inter.variable} antialiased font-cairo`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
