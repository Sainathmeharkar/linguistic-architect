# Deploy to Cloudflare Pages

## Quick Start (Recommended)

### Option 1: Connect GitHub Repository (Automatic)
This is the easiest method and provides automatic deployments on every push to main.

1. **Go to Cloudflare Dashboard**
   - Login to https://dash.cloudflare.com/
   - Select "Pages" from the left sidebar
   - Click "Create a project"

2. **Connect Git Repository**
   - Click "Connect to Git"
   - Authorize GitHub and select "Sainathmeharkar/linguistic-architect"
   - Click "Begin setup"

3. **Configure Build Settings**
   - **Project name:** `linguistic-architect`
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - Leave environment variables empty (unless you add custom ones)
   - Click "Save and Deploy"

4. **Wait for Deployment**
   - Cloudflare will automatically build and deploy your site
   - You'll get a URL like: `https://linguistic-architect-xyz.pages.dev`
   - Every future push to `main` will auto-deploy

---

### Option 2: Deploy via Wrangler CLI (Manual)

If you prefer command-line deployment:

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```
   This opens your browser to authorize

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Deploy to Pages**
   ```bash
   wrangler pages deploy dist
   ```

5. **Get Your URL**
   - After successful deployment, you'll see a URL like:
   - `https://linguistic-architect-abc123.pages.dev`

---

### Option 3: Manual ZIP Upload

1. Build the project locally:
   ```bash
   npm run build
   ```

2. Go to Cloudflare Pages > Create Project > Upload assets

3. Select the `dist` folder created by the build

4. Cloudflare will host your files automatically

---

## Deployment Details

### What Gets Deployed
- **Source:** `dist/` folder (created by `npm run build`)
- **Files:** All compiled React, CSS, and JavaScript
- **Size:** ~500KB (uncompressed)
- **Assets:** Public folder files included

### Build Process
```
npm run build
  ↓
Vite compiles React JSX
  ↓
Tailwind CSS processed
  ↓
Creates optimized dist/ folder
  ↓
Deployed to Cloudflare CDN
```

### Environment
- **Node Version:** 18+ (automatic on Cloudflare Pages)
- **Runtime:** Browser (client-side only, no backend needed)
- **Features Used:** Fetch API (for translation APIs)

---

## Configuration Files Included

### `wrangler.toml`
- Cloudflare Pages configuration
- Build command and output directory specified
- Production environment setup

### `vite.config.js`
- Optimized for production builds
- Enables minification and tree-shaking
- Configured for Cloudflare environment

---

## Post-Deployment

### Update GitHub
After your first deployment, commit the wrangler config:
```bash
git add wrangler.toml
git commit -m "Add Cloudflare Pages configuration"
git push
```

### Custom Domain (Optional)
1. In Cloudflare Pages settings > Custom domains
2. Add your own domain if you have one
3. CNAME to `linguistic-architect-xyz.pages.dev`

### Environment Variables (If Needed)
If you add API keys or configuration later:
1. Pages > Settings > Environment variables
2. Add variables for production
3. Redeploy

---

## Features That Work on Cloudflare Pages

✅ **All features supported:**
- ✅ Translation API calls (LibreTranslate)
- ✅ Grammar checking (LanguageTool)
- ✅ File uploads (client-side)
- ✅ localStorage (browser storage)
- ✅ Keyboard shortcuts
- ✅ Clipboard API
- ✅ Drag & drop
- ✅ Theme toggle

❌ **Limitations:**
- ❌ Server-side code (not applicable for this app)
- ❌ Database connections (use external services)
- ❌ Backend APIs (this app is fully client-side)

---

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally first
- Verify Node version compatibility (need 18+)
- Check for missing dependencies

### Site Shows 404
- Ensure `dist` folder is being deployed
- Check build output directory in settings
- Try redeploying manually

### API Calls Failing
- LibreTranslate and LanguageTool are CORS-enabled
- Check browser console for errors
- Verify internet connection on client

### Slow Performance
- Enable Cloudflare caching in settings
- Compress images further
- Use Cloudflare analytics to debug

---

## Monitoring & Analytics

After deployment:
1. Go to Cloudflare Pages dashboard
2. View analytics for:
   - Page views
   - Requests
   - Cache hit ratio
   - Error rates

3. Set up notifications for deployment status

---

## Next Steps

1. Deploy to Cloudflare Pages using Option 1 (GitHub integration)
2. Share your deployment URL: `https://linguistic-architect-xyz.pages.dev`
3. (Optional) Add custom domain
4. (Optional) Set up error tracking/monitoring

Your Linguistic Architect app is now live on a global CDN! 🚀
