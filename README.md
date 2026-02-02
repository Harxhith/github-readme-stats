# 🦇 Batman-Themed GitHub Stats

> A Vercel Serverless Function that generates dynamic, Batman-styled statistics for your GitHub Profile README.

![Stats Preview](api/stats)

## Features

- **Batman Theme**: Deep charcoal background (`#0a0a0a`), tactical gray accents, and signature yellow highlights.
- **Core Stats**: Total Stars, Commits, Pull Requests, **Total Repositories**, and **Contributed To (last year)**.
- **Top Languages**: Automatically calculated top 5 languages by code size (excluding boilerplate like HTML/CSS).
- **Performance**: High-performance SVG generation with built-in caching (4 hours).

---

## 🚀 How to Use (For Yourself)

You can easily host your own version of this stats card without writing any code.

### Step 1: Fork this Repository

Click the **Fork** button at the top right of this page to create your own copy of this repository.

### Step 2: Generate a GitHub Token

You need a GitHub Personal Access Token to allow the code to fetch your stats.

1.  Go to **[GitHub Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)**.
2.  Click **Generate new token (classic)**.
3.  Name it (e.g., "Readme Stats").
4.  **Important**: Select the following scopes:
    - `repo` (Full control of private repositories - required to count private commits)
    - `read:user` (Read all user profile data)
5.  Click **Generate token** and **copy it** immediately.

### Step 3: Deploy to Vercel

1.  Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the repository you just forked.
4.  In the **Configure Project** screen, find the **Environment Variables** section.
5.  Add a new variable:
    - **Key**: `GH_TOKEN`
    - **Value**: `PASTE_YOUR_COPIED_TOKEN_HERE`
6.  Click **Deploy**.

### Step 4: Add to your Profile

Once deployed, Vercel will give you a domain (e.g., `https://your-repo-name.vercel.app`).

Add this markdown to your GitHub Profile `README.md`:

```markdown
![My Stats](https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/stats)
```

---

## 🛠 Local Development

If you want to modify the code or theme:

1.  **Clone the repo**:

    ```bash
    git clone https://github.com/<your-username>/github-readme-stats-batman.git
    cd github-readme-stats-batman
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run locally** (requires Vercel CLI):
    ```bash
    vercel dev
    ```

## 🎨 Customization

You can change the colors in `api/stats.ts` to match your own style:

```typescript
const THEME = {
  bg: "#0a0a0a", // Background
  border: "#222222", // Border color
  accentSecondary: "#333333", // Secondary elements (Gray)
  accentPrimary: "#f2d41f", // Main accent (Yellow)
  textMain: "#e0e0e0", // Main text
  textMuted: "#666666", // Subtitles
};
```
