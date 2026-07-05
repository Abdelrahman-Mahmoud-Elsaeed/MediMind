import "./globals.css";

export const metadata = {
  title: "MediMind",
  description: "Medication management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}