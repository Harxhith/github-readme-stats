# GitHub Stats

> A Vercel Serverless Function that generates dynamic, Batman-themed statistics for your GitHub Profile README.

![Stats Preview](https://github-readme-stats-virid-eight-90.vercel.app/api/stats/?cache_buster=7)

## Features

- **Batman Theme**: Minimalistic deep black background (`#000000`) with subtle gray accents (`#A3A3A3` and `#525252`).
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

GitHub proxies all images, so **automatic mobile detection does not work** on GitHub Profiles.

To ensure your stats card looks perfect on mobile devices, you **must** use the `<picture>` tag. This forces the browser to load the mobile layout on small screens.

Copy and paste this code into your `README.md`:

```html
<div align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark) and (max-width: 480px)"
      srcset="https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/stats?layout=mobile"
    />
    <source
      media="(max-width: 480px)"
      srcset="https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/stats?layout=mobile"
    />
    <img
      src="https://<YOUR-VERCEL-DOMAIN>.vercel.app/api/stats"
      alt="Github Stats"
    />
  </picture>
</div>
```

**Note:** Replace `<YOUR-VERCEL-DOMAIN>` with your actual deployment URL.

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
  bg: "#000000", // Deep Black
  cardBg: "#0D0D0D", // Very Dark Gray for cards
  border: "#1A1A1A", // Dark Gray Border
  accentPrimary: "#A3A3A3", // Light Gray Accent
  accentSecondary: "#525252", // Mid Gray Accent
  neonBorder: "#262626", // Dark Gray Border instead of Neon
  textMain: "#E5E5E5", // Off-White for better readability
  textMuted: "#737373", // Muted Gray
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};
```
