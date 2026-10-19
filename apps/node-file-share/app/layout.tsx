export const metadata = { title: "File share" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ font: "16px/1.4 system-ui, sans-serif", maxWidth: "40rem", margin: "2rem auto", padding: "0 1rem" }}>
        {children}
      </body>
    </html>
  );
}
