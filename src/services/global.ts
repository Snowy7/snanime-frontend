import { AniListService } from "./anilist/service";
import { SnAnimeService } from "./snanime/service";

// Create global instances
export const anilistService = AniListService.getInstance();
export const snanimeService = SnAnimeService.getInstance(); 