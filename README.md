# Batman-Themed GitHub Stats

A Vercel Serverless Function that generates dynamic, Batman-styled statistics for your GitHub Profile README.

![Stats Preview](api/stats)

## Features

- **Batman Theme**: Deep charcoal background (`#0a0a0a`), tactical gray accents, and signature yellow highlights.
- **core Stats**: Total Stars, Commits, Pull Requests, and Repositories.
- **Top Languages**: Automatically calculated top 5 languages by code size (excluding boilerplate like HTML/CSS).
- **Performance**: High-performance SVG generation with built-in caching (4 hours).

## Setup & Deployment

### 1. Generate a GitHub Token

You need a Personal Access Token to fetch your data.

1.  Go to [GitHub Developer Settings > Personal Access Tokens](https://github.com/settings/tokens).
2.  Generate a new **Classic** token.
3.  Select the following scopes:
    - `repo` (Full control of private repositories)
    - `read:user` (Read all user profile data)
4.  Copy the token (e.g., `ghp_...`).

### 2. Deploy to Vercel

1.  Install the Vercel CLI (optional) or push this code to a GitHub repository.
2.  Import the project into Vercel.
3.  In the **Environment Variables** section of your Vercel Project Settings, add:
    - **Key**: `GH_TOKEN`
    - **Value**: `<PASTE_YOUR_GITHUB_TOKEN_HERE>`
4.  Deploy!

## Usage

Once deployed, use the URL to your Vercel app to display the image.

### In your GitHub Profile README.md:

```markdown
![My Stats](https://<your-project-name>.vercel.app/api/stats)
```

### Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run with Vercel CLI:
    ```bash
    vercel dev
    ```

## Customization

You can customize the colors by editing the `THEME` object in `api/stats.ts`:

```typescript
const THEME = {
  bg: "#0a0a0a",
  border: "#222222",
  accentSecondary: "#333333",
  accentPrimary: "#f2d41f", // Change this for a different accent color
  // ...
};
```
