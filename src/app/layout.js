import "./globals.css";

export const metadata = {
  title: "MoM Tracker",
  description: "Meeting Minutes Management System",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}