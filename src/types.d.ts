type AnimeType = "TV" | "OVA" | "Movie" | "Special" | "ONA" | "Music" | "CM" | "PV" | "TV Special" | "Unknown";
type AnimeAirStatus = "Finished Airing" | "Airing" | "Not Yet Aired" | "Unknown";
type AnimeAirStatus2 = "Completed" | "Ongoing" | "Upcoming" | "Unknown";
type AnimeRating = "None" | "G" | "PG" | "PG-13+" | "R-17+" | "R+" | "Rx" | "Unknown";
type AnimeSeason = "Summer" | "Winter" | "Spring" | "Fall" | "Unknown";

interface AnilistAnime {
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

interface SnAnimePaginatedResult<T> {
  currentPage: number; // Current page number
  hasNextPage: boolean; // Indicates if there is a next page
  totalPages: number; // Total number of pages available
  results: T[]; // Array of results of type T
}

interface SnAnimeSearchResult {
  id: string; // Unique identifier for the anime
  title: string; // Title of the anime
  url: string; // URL to the anime page
  image: string; // URL to the anime image
  duration: string; // Duration of the anime episode (e.g., "23m")
  japaneseTitle: string; // Japanese title of the anime
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
  sub: number; // Number of subbed episodes available
  dub: number; // Number of dubbed episodes available
  nsfw: boolean; // Indicates if the anime is NSFW (Not Safe For Work)
  episodes: number; // Total number of episodes available
}

interface SnAnimeSpotlight {
  id: string; // Unique identifier for the anime ex: "one-piece-100"
  title: string; // Title of the anime
  japaneseTitle: string; // Japanese title of the anime
  banner: string; // URL to the anime banner image
  rank: number; // Rank of the anime in the spotlight
  description: string; // Description of the anime
  url: string; // URL to the anime page
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
  duration: string; // Duration of the anime episode (e.g., "24m")
  releaseDate: string; // Release date of the anime (e.g., "Oct 20, 1999")
  quality: string; // Quality of the anime (e.g., "HD")
  sub: number; // Number of subbed episodes available
  dub: number; // Number of dubbed episodes available
  episodes: number; // Total number of episodes available
}

interface SnAnimeRecentlyUpdated {
  id: string; // Unique identifier for the anime
  title: string; // Title of the anime
  japaneseTitle: string; // Japanese title of the anime
  image: string; // URL to the anime image
  url: string; // URL to the anime page
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
  sub: number; // Number of subbed episodes available
  dub: number; // Number of dubbed episodes available
  episodes: number; // Total number of episodes available
  duration: string; // Duration of the anime episode (e.g., "23m")
  watchList: string; // Watchlist status (e.g., "none", "watching", "completed")
  nsfw: boolean; // Indicates if the anime is NSFW (Not Safe For Work
}

interface SnAnimeData {
  id: string; // Unique identifier for the anime, e.g., "lazarus-19543"
  title: string; // Title of the anime, e.g., "Lazarus"
  malID: number; // MyAnimeList ID for the anime, e.g., 56038
  alID: number; // Anilist ID for the anime, e.g., 167336
  image: string; // URL to the anime image
  banner: string; // URL to the anime banner image
  japaneseTitle: string; // Japanese title of the anime, e.g., "ラザロ"
  description: string; // Description of the anime
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
  url: string; // URL to the anime page
  recommendations: SnAnimeRecommendations[]; // List of recommended anime
  relatedAnime: SnAnimeRelated[]; // List of related anime
  subOrDub: "sub" | "dub" | "both"; // Indicates if the anime has subbed, dubbed, or both versions
  hasSub: boolean; // Indicates if the anime has a subbed version
  hasDub: boolean; // Indicates if the anime has a dubbed version
  genres: string[]; // List of genres associated with the anime (e.g., ["Action", "Sci-Fi"])
  status: AnimeAirStatus2; // Airing status of the anime (e.g., "Completed", "Airing")
  totalEpisodes: number; // Total number of episodes in the anime
  season: AnimeSeason; // Season of the anime (e.g., "Spring 2025")
  episodes: SnAnimeEpisode[]; // List of episodes in the anime
  studio: string; // Studio that produced the anime (e.g., "Studio Bones")
  rating: number; // Average rating of the anime (e.g., 8.5)
  source: string; // Source of the anime (e.g., "Manga", "Light Novel")
}

interface SnAnimeRecommendations {
  id: string; // Unique identifier for the anime
  title: string; // Title of the anime
  url: string; // URL to the anime page
  image: string; // URL to the anime image
  duration: string; // Duration of the anime episode (e.g., "23m")
  watchList: string; // Watchlist status (e.g., "none", "watching", "completed")
  japaneseTitle: string; // Japanese title of the anime
  type: AnimeType; // Type of the anime (e.g., TV, OVA, Movie)
  nsfw: boolean; // Indicates if the anime is NSFW (Not Safe For Work)
  sub: number; // Number of subbed episodes available
  dub: number; // Number of dubbed episodes available
  episodes: number; // Total number of episodes available
}

interface SnAnimeRelated {
  id: string; // Unique identifier for the related anime
  title: string; // Title of the related anime
  url: string; // URL to the related anime page
  image: string; // URL to the related anime image
  japaneseTitle: string; // Japanese title of the related anime
  type: AnimeType; // Type of the related anime (e.g., TV, OVA, Movie)
  sub: number; // Number of subbed episodes available
  dub: number; // Number of dubbed episodes available
  episodes: number; // Total number of episodes available
}

interface SnAnimeEpisode {
  id: string; // Unique identifier for the episode, e.g., "lazarus-19543$episode$136183"
  number: number; // Episode number, e.g., 1
  title: string; // Title of the episode, e.g., "Goodbye Cruel World"
  isFiller: boolean; // Indicates if the episode is a filler episode
  isSubbed: boolean; // Indicates if the episode is available in subbed version
  isDubbed: boolean; // Indicates if the episode is available in dubbed version
  url: string; // URL to the episode page
  thumbnail: string; // URL to the episode thumbnail image
  duration: number;
  description?: string; // Optional, if available
}

interface SnEpisodeDetails {
  animeId: string; // Unique identifier for the anime, e.g., "lazarus-19543"
  animeTitle: string; // Title of the anime, e.g., "Lazarus"
  id: string; // Unique identifier for the episode, e.g., "lazarus-19543$episode$136183"
  number: number; // Episode number, e.g., 1
  title: string; // Title of the episode, e.g., "Goodbye Cruel World"
  isFiller: boolean; // Indicates if the episode is a filler episode
  isSubbed: boolean; // Indicates if the episode is available in subbed version
  isDubbed: boolean; // Indicates if the episode is available in dubbed version
  streams: SnEpisodeStream; // List of streams available for the episode
  allEpisodes: SnLiteEpisode[]; // List of all episodes in the anime
  description?: string; // Optional, if available
}

interface SnLiteEpisode {
  id: string; // Unique identifier for the episode, e.g., "lazarus-19543$episode$136183"
  number: number; // Episode number, e.g., 1
  title: string; // Title of the episode, e.g., "Goodbye Cruel World"
}

interface SnEpisodeStream {
  headers: Record<string, string>; // Headers to be sent with the request
  subtitles: SnEpisodeSubtitle[]; // List of subtitles available for the stream
  intro: SnEpisodeRange; // Intro range for the episode
  outro: SnEpisodeRange; // Outro range for the episode
  sources: SnEpisodeSource[]; // List of sources available for the episode
}

interface SnEpisodeSubtitle {
  url: string; // URL to the subtitle file
  lang: string; // Language of the subtitle
}

interface SnEpisodeRange {
  start: number; // Start time of the range in seconds
  end: number; // End time of the range in seconds
}

interface SnEpisodeSource {
  url: string; // URL to the video stream
  isM3U8: boolean; // Indicates if the source is an M3U8 stream
  type: string; // Type of the video stream (e.g., "hls", "mp4", "webm")
}

