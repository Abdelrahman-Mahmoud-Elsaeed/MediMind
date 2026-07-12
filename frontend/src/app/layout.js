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
  title: "MediMind",
  description: "Medication management platform",
};

export default async function RootLayout({ children }) {

  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${manrope.variable} ${inter.variable} antialiased`} suppressHydrationWarning>
        <Providers locale={locale} >
          {children}
        </Providers>
      </body>
    </html>
  );
}
