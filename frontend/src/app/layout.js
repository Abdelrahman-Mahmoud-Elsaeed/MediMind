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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default async function RootLayout({ children }) {

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <Providers locale={locale} >
          {children}
        </Providers>
      </body>
    </html>
  );
}
