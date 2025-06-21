import { AnimeProvider } from "@/context/AnimeContext";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <AnimeProvider>{children}</AnimeProvider>
    </LanguageProvider>
  );
}
