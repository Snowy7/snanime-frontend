import { headers, cookies } from "next/headers"

type Language = "en" | "ar";

const availableLanguages = [
  { code: "en" as Language, name: "English" },
  { code: "ar" as Language, name: "Arabic" },
];

/**
 * Get the user's preferred language on the server side
 * Priority: 1. Cookie, 2. Accept-Language header, 3. Default to "en"
 */
export async function getServerLanguage(): Promise<Language> {
  try {
    // First check if user has explicitly set a language via cookie
    const cookieStore = await cookies();
    const savedLanguage = cookieStore.get("app-language")?.value as Language;
    
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }

    // Fallback to Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    
    if (acceptLanguage) {
      // Parse Accept-Language header (e.g., "en-US,en;q=0.9,ar;q=0.8")
      const languages = acceptLanguage
        .split(",")
        .map(lang => {
          const [code, q = "q=1"] = lang.trim().split(";");
          const quality = parseFloat(q.split("=")[1] || "1");
          return { code: code.split("-")[0], quality };
        })
        .sort((a, b) => b.quality - a.quality);

      // Find the first supported language
      for (const lang of languages) {
        const supportedLang = availableLanguages.find(
          available => available.code === lang.code
        );
        if (supportedLang) {
          return supportedLang.code;
        }
      }
    }

    // Default fallback
    return "en";
  } catch (error) {
    console.warn("Error detecting server language:", error);
    return "en";
  }
} 