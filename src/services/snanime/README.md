# SnAnime API Documentation

A comprehensive anime API for fetching anime data, user profiles, and more. This API serves as the backend for the SnAnime application.

## Base URL

```
https://snanime-api.snowydev.xyz/api/v1
```

For local development:
```
http://localhost:5000/api/v1
```

## Authentication (Not implemented yet)

The API uses Bearer token authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer your_token_here'
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage. Current limits:
- 100 requests per minute per IP address
- Cached responses for 5 minutes on GET requests (when enabled)

## API Endpoints

### Anime Routes

#### Get Anime Information
```typescript
GET /anime/:id

// Response Type
interface IAnimeInfo {
  id: string;
  malId: number;
  title: string;
  synonyms: string[];
  description: string;
  posterUrl: string;
  bannerImage?: string;
  type: string;
  status: string;
  season: string;
  year: string;
  totalEpisodes: number;
  subOrDub: "sub" | "dub" | "both";
  genres: string[];
  averageScore?: number;
  studios?: string[];
  producers?: string[];
  duration?: number;
  score?: number;
  relatedAnime?: Array<{
    id: string;
    malId: number;
    title: string;
    type: string;
    status: string;
    relationType: string;
    posterUrl?: string;
    season?: string;
    year?: string;
    totalEpisodes?: number;
    genres?: string[];
    averageScore?: number;
  }>;
}

// Example Usage
const response = await fetch('https://api.snanime.com/api/v1/anime/123');
const animeInfo = await response.json();
```

#### Get Latest Anime
```typescript
GET /anime/latest

// Response Type
interface IAnimeLatest {
  id: string;
  title: string;
  posterUrl: string;
  type: string;
  status: string;
  season: string;
  year: string;
  totalEpisodes: number;
}

// Example Usage
const response = await fetch('https://api.snanime.com/api/v1/anime/latest');
const latestAnime = await response.json();
```

#### Get Spotlight Anime
```typescript
GET /anime/spotlight

// Response Type
interface IAnimeSpotlight {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl: string;
  description: string;
  rank: number;
  type: string;
  duration: string;
  year: number;
  totalEpisodes: number;
}

// Example Usage
const response = await fetch('https://api.snanime.com/api/v1/anime/spotlight');
const spotlightAnime = await response.json();
```

#### Get Episode Details
```typescript
GET /anime/episode/:animeId/:episodeNumber

// Response Type
interface IEpisodeDetails {
  animeId: string;          // Unique identifier for the anime
  animeTitle: string;       // Title of the anime
  id: string;              // Unique identifier for the episode
  number: number;          // Episode number
  title: string;           // Title of the episode
  isFiller: boolean;       // Indicates if the episode is a filler
  description?: string;    // Optional episode description
  streams: {
    headers: Record<string, string>;  // Headers for the request
    subtitles: Array<{
      url: string;        // URL to the subtitle file
      lang: string;       // Language of the subtitle
    }>;
    intro: {
      start: number;      // Start time in seconds
      end: number;        // End time in seconds
    };
    outro: {
      start: number;      // Start time in seconds
      end: number;        // End time in seconds
    };
    sources: Array<{
      url: string;        // URL to the video stream
      isM3U8: boolean;    // Indicates if it's an HLS stream
      type: string;       // Stream type (e.g., "hls", "mp4")
    }>;
  };
  allEpisodes: Array<{    // List of all episodes
    id: string;
    number: number;
    title: string;
  }>;
}

// Example Usage
const response = await fetch('https://api.snanime.com/api/v1/anime/episode/1:123/1');
const episodeDetails = await response.json();
```

### Proxy Routes

The proxy routes are used for serving optimized images and other media content.

```typescript
GET /proxy/image?url=encoded_image_url
GET /proxy/video?url=encoded_video_url
```

### Health Check

```typescript
GET /health

// Response
{
  "status": "ok",
  "timestamp": "2024-03-20T12:00:00Z",
  "version": "1.0.0"
}
```

## Response Format

All API responses follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
  version: string;
}
```

## Pagination

Endpoints that return lists support pagination:

```typescript
interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

Example usage:
```typescript
// Fetch page 2 with 20 items per page
const response = await fetch('/api/v1/anime/list?page=2&limit=20');
const result = await response.json();
```

## Language Support

Most endpoints support a `language` query parameter to specify the preferred language for the response:

```typescript
// Default is English (en)
const response = await fetch('/api/v1/anime/123?language=en');

// Arabic support coming soon
// const response = await fetch('/api/v1/anime/123?language=ar');
```

Currently supported languages:
- `en` - English (default)
- `ar` - Arabic (coming soon)

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages:

```typescript
interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Example error response
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Invalid anime ID"],
  "timestamp": "2024-03-20T12:00:00Z",
  "version": "1.0.0"
}
```

## Development Documentation

When running in development mode (non-production), additional documentation is available:

- Swagger UI: `/api/docs`
- Scalar API Reference: `/reference`
- OpenAPI JSON: `/openapi.json`

## Example Integration (React)

```typescript
import { useState, useEffect } from 'react';

interface AnimeService {
  getAnimeInfo: (id: string) => Promise<IAnimeInfo>;
  getLatestAnime: () => Promise<IAnimeLatest[]>;
  getSpotlightAnime: () => Promise<IAnimeSpotlight[]>;
  getEpisodeDetails: (animeId: string, episodeNumber: string) => Promise<IEpisodeDetails>;
}

const API_BASE = 'https://api.snanime.com/api/v1';

export const animeService: AnimeService = {
  getAnimeInfo: async (id: string) => {
    const response = await fetch(`${API_BASE}/anime/${id}`);
    if (!response.ok) throw new Error('Failed to fetch anime info');
    const data = await response.json();
    return data.data;
  },

  getLatestAnime: async () => {
    const response = await fetch(`${API_BASE}/anime/latest`);
    if (!response.ok) throw new Error('Failed to fetch latest anime');
    const data = await response.json();
    return data.data;
  },

  getSpotlightAnime: async () => {
    const response = await fetch(`${API_BASE}/anime/spotlight`);
    if (!response.ok) throw new Error('Failed to fetch spotlight anime');
    const data = await response.json();
    return data.data;
  },

  getEpisodeDetails: async (animeId: string, episodeNumber: string) => {
    const response = await fetch(`${API_BASE}/anime/episode/${animeId}/${episodeNumber}`);
    if (!response.ok) throw new Error('Failed to fetch episode details');
    const data = await response.json();
    return data.data;
  },
};

// React Component Example
function AnimeDetails({ id }: { id: string }) {
  const [anime, setAnime] = useState<IAnimeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const data = await animeService.getAnimeInfo(id);
        setAnime(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch anime');
      }
    };

    fetchAnime();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!anime) return <div>Loading...</div>;

  return (
    <div>
      <h1>{anime.title}</h1>
      <img src={anime.posterUrl} alt={anime.title} />
      <p>{anime.description}</p>
      {/* ... other anime details ... */}
    </div>
  );
}
```

## Environment Variables

For frontend development, ensure these environment variables are set:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1  # Development
VITE_API_BASE_URL=https://snanime-api.snowydev.xyz/api/v1  # Production
```

## CORS

The API supports CORS for specified origins. Make sure your frontend domain is included in the CORS configuration. 