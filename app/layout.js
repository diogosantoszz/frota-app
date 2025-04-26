import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}