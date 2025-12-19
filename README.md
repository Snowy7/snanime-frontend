# SnAnime Frontend

Next.js frontend for SnAnime with StackAuth authentication.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- SnAnime API v2 running
- Self-hosted StackAuth server

### Environment Variables

Create a `.env.local` file:

```env
# SnAnime API
NEXT_PUBLIC_SNANIME_API_URL=http://localhost:3000

# Appwrite (Self-Hosted)
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

## Features

- 🎬 **Anime Streaming**: Watch anime with multiple sources
- 🔐 **Authentication**: Google OAuth + Email via Appwrite (self-hosted)
- 📋 **Watchlist**: Track your anime progress
- ❤️ **Favorites**: Save your favorite anime
- 📊 **Watch History**: Continue where you left off
- 🔥 **Trending Page**: Discover popular anime
- 🕐 **Latest Episodes**: Stay up to date with new releases
- 👤 **User Profile**: View your stats and manage your account
- ⚙️ **Settings**: Customize your experience
- 🌐 **Multilingual**: English and Arabic support

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with spotlight and latest anime |
| `/browse` | Browse and search anime |
| `/trending` | Trending anime with pagination |
| `/latest` | Latest episodes |
| `/anime/:id` | Anime details |
| `/anime/:id/watch/:ep` | Watch episode |
| `/watchlist` | Your watchlist (auth required) |
| `/favorites` | Your favorites (auth required) |
| `/history` | Watch history (auth required) |
| `/profile` | User profile (auth required) |
| `/profile/settings` | Account settings (auth required) |
| `/login` | Sign in (redirects to StackAuth) |
| `/signup` | Sign up (redirects to StackAuth) |

## Authentication Flow

The app uses Appwrite for authentication:

1. User clicks Sign In → Shows login page with Google OAuth + Email options
2. On success → Session stored by Appwrite SDK
3. JWT token obtained for API calls
4. Token sent to API for protected routes

## API Integration

- **Anime endpoints**: No authentication required
- **User endpoints**: Require `Authorization: Bearer <jwt>` header

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── anime/           # Anime pages
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   └── ...
├── components/          # React components
├── context/             # React contexts (Auth, Anime, Language)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities
│   └── appwrite.ts      # Appwrite client configuration
├── services/            # API services
│   ├── snanime/         # SnAnime API service
│   ├── anilist/         # Anilist service
│   └── user.ts          # User API service
└── types/               # TypeScript types
```

## Appwrite Self-Hosting

This app uses self-hosted Appwrite for authentication.

### 1. Deploy Appwrite

```bash
# Using Docker
docker run -d --name appwrite \
  -p 80:80 -p 443:443 \
  -v appwrite-uploads:/storage/uploads:rw \
  -v appwrite-cache:/storage/cache:rw \
  -v appwrite-config:/storage/config:rw \
  -v appwrite-certificates:/storage/certificates:rw \
  -v appwrite-functions:/storage/functions:rw \
  appwrite/appwrite:latest
```

Or follow the official guide: https://appwrite.io/docs/self-hosting

### 2. Create Project

1. Go to your Appwrite console (http://localhost or your domain)
2. Create a new project
3. Note down the **Project ID**

### 3. Configure OAuth (Google)

1. In Appwrite Console → Auth → Settings → OAuth2 Providers
2. Enable **Google**
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create OAuth 2.0 Client ID (Web application)
   - Add redirect URI: `https://your-appwrite-domain/v1/account/sessions/oauth2/callback/google/project-id`
4. Enter Client ID and Client Secret in Appwrite

### 4. Create API Key

1. In Appwrite Console → Overview → API Keys
2. Create a key with scopes: `users.read`
3. Copy the secret for backend `.env`

### 5. Environment Variables

Frontend `.env.local`:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_SNANIME_API_URL=http://localhost:3000
```

Backend `.env`:
```env
APPWRITE_ENDPOINT=http://localhost/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

## License

ISC
