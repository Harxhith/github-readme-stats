# ⚡ Neon GitHub Stats

> A Vercel Serverless Function that generates dynamic, Neon-styled statistics for your GitHub Profile README.

![Stats Preview](https://github-readme-stats-virid-eight-90.vercel.app/api/stats/?cache_buster=2)

## Features

- **Neon Cyberpunk Theme**: Deep black background (`#050505`) with vibrant Neon Cyan (`#00f2ff`) and Purple (`#bd00ff`) accents.
- **Responsive Layout**: **Automatically detects mobile devices** and switches to a stacked vertical layout for better readability.
- **Bento Grid Layout**: Modern, clean grid design for stats presentation.
- **Core Stats**: Total Stars, Commits, Pull Requests, Repositories, and Contributions.
- **Top Languages**: Vibrant segmented bar showing your top languages.
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

### 📱 Mobile & Responsive

The card detects the User-Agent (browser) of the viewer.

- **Desktop**: Shows the wide "Bento Grid" layout.
- **Mobile**: Automatically switches to a vertical stacked layout.

You can also force the mobile layout by appending `?layout=mobile`:

```markdown
![My Stats Mobile](https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/stats?layout=mobile)
```

---

## 🛠 Local Development

If you want to modify the code or theme:

1.  **Clone the repo**:

    ```bash
    git clone https://github.com/<your-username>/github-readme-stats.git
    cd github-readme-stats
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
  bg: "#050505", // Deep Black
  cardBg: "#0a0a0a", // Slightly lighter card bg
  border: "#333333",
  accentPrimary: "#00f2ff", // Neon Cyan
  accentSecondary: "#bd00ff", // Neon Purple
  neonBorder: "#1ec500ff", // Neon Green
  textMain: "#ffffff",
  textMuted: "#888888",
};
```
