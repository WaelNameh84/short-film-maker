export const metadata = {
  title: 'Short Film Maker',
  description: 'Create short cinematic video prompts',
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
