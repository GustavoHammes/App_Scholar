import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

// Fonte Inter — limpa e profissional, adequada para sistemas de gestão
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App Scholar — FATEC Jacareí",
  description: "Sistema de Gerenciamento de Boletim Acadêmico",
};

/**
 * Layout raiz da aplicação
 * Envolve toda a app com o provedor de autenticação e o sistema de notificações toast
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {/* Provedor de autenticação — disponibiliza o contexto em toda a app */}
        <AuthProvider>
          {children}

          {/* Sistema de notificações flutuantes (toasts) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1e293b",
                color: "#f8fafc",
                fontSize: "0.875rem",
                borderRadius: "8px",
              },
              success: {
                iconTheme: { primary: "#4ade80", secondary: "#1e293b" },
              },
              error: {
                iconTheme: { primary: "#f87171", secondary: "#1e293b" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
