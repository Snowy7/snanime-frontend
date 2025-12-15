import { AnimeProvider } from "@/context/AnimeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AnimeProvider>{children}</AnimeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
