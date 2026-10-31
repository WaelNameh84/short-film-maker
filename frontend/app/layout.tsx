export const metadata = {
  title: 'Short Film Maker',
  description: 'Create short cinematic video prompts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
