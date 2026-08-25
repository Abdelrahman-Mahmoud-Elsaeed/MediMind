import { Manrope, Inter } from "next/font/google";
import { Providers } from "./providers";
import { cookies } from "next/headers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    template: '%s | MediMind',
    default: 'MediMind | Medication Management',
  },
  description: "Your digital companion for medication adherence and trusted caregiver connections.",
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default async function RootLayout({ children }) {

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body className={`${manrope.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <Providers locale={locale} >
          {children}
        </Providers>
      </body>
    </html>
  );
}
