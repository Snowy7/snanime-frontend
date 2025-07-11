import { AnimeFormat, AnimeSeason, AnimeSort, AnimeStatus } from "@/types/anime";

export interface FilterState {
  format: AnimeFormat[];
  season?: AnimeSeason;
  seasonYear?: number;
  status?: AnimeStatus;
  genres: string[];
  sort: AnimeSort[];
} 