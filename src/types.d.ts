type AnimeType = "TV" | "OVA" | "Movie" | "Special" | "ONA" | "Music" | "CM" | "PV" | "TV Special" | "Unknown";
type AnimeAirStatus = "Finished Airing" | "Airing" | "Not Yet Aired" | "Unknown";
type AnimeRating = "None" | "G" | "PG" | "PG-13+" | "R-17+" | "R+" | "Rx" | "Unknown";
type AnimeSeason = "Summer" | "Winter" | "Spring" | "Fall" | "Unknown";

interface Anime {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  rating: number;
  year: number;
  status: string; // e.g., "Completed", "Airing"
  type: AnimeType;
  genres: string[];
  sub: string; // e.g., "Sub | Dub"
  episodesCount?: number; // Optional, if available
  studio?: string; // Optional, if available
  source?: string; // Optional, if available
  related?: RelatedAnime[]; // Optional, if available
  characters?: Character[]; // Optional, if available
  staff?: Staff[]; // Optional, if available
}

interface Character {
  id: string;
  name: string;
  role: string; // e.g., "Main", "Supporting"
  imageUrl: string; // URL to the character image
}

interface Staff {
  id: string;
  name: string;
  role: string; // e.g., "Director", "Writer", "Voice Actor"
  imageUrl: string; // URL to the staff member's image
}


interface RelatedAnime {
  id: string;
  title: string;
  posterUrl: string; // URL to the related anime poster image
  type: AnimeType; // Type of the related anime (e.g., TV, OVA, Movie)
}

interface LatestEpisode {
  id: string;
  title: string;
  episodeNumber: number;
  posterUrl: string; // URL to the episode poster image
  description?: string; // Optional, if available
  year?: number; // Optional, if available
  rating?: string; // Optional, if available
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
}

interface AnimeEpisode {
  title: string;
  thumbnail: string; // URL to the episode thumbnail image
  episodeNumber: number;
  episodeString: string;
  duration: number;
  description?: string; // Optional, if available
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean; // Indicates if there are more pages available
  hasPreviousPage: boolean; // Indicates if there are previous pages available
}

interface LiteEpisode {
  episodeNumber: number;
  episodeTitle: string;
}

interface EpisodeDetails {
  animeId: string;
  animeTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  episodeThumbnail: string;
  episodeDescription?: string; // Optional, if available

  servers: Server[]; // List of servers available for the episode
  allEpisodes: LiteEpisode[]; // List of all episodes in the anime
}

interface Server {
  id: string;
  streams: EpisodeStream[]; // List of streams available for the server
}

interface EpisodeStream {
  id: string; // Unique identifier for the stream
  url: string; // Direct URL to the video stream
  quality: string; // Quality of the stream (e.g., "1080p", "720p", "480p")
  type: string; // Type of the stream (e.g., "video/mp4", "video/webm")
  referer: string; // Referer URL for the stream
}

interface SearchResult {
  id: string; // Unique identifier for the anime
  title: string; // Title of the anime
  posterUrl: string; // URL to the anime poster image
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
  year: number; // Year of release
  rating: number; // Average rating of the anime
  status: AnimeAirStatus; // Airing status of the anime (e.g., "Airing", "Finished Airing")
  genres: string[]; // List of genres associated with the anime
  sub: string; // Sub/Dub information (e.g., "Sub", "Dub", "Sub | Dub")
}
