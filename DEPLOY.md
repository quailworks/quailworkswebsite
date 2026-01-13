# Quailworks Deployment Guide

## Pre-Deployment Checklist

Before deploying, complete these steps:

### 1. Configure Contact Form (Required)

Replace the Formspree placeholder with your form ID:

1. Create account at https://formspree.io
2. Create a new form
3. Copy your form ID (e.g., `xyzabc123`)
4. Edit `index.html`, find this line:
   ```html
   <form class="contact__form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
5. Replace `YOUR_FORM_ID` with your actual form ID

### 2. Generate Favicon (Required)

Generate favicon files from your logo:

**Option A: Online Generator (Recommended)**
1. Visit https://realfavicongenerator.net
2. Upload `assets/images/quailnavyHD.png`
3. Configure settings (keep navy background)
4. Download the favicon package
5. Extract to `assets/favicon/`:
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

**Option B: Manual Creation**
Create these files at minimum sizes:
- `assets/favicon/favicon-16x16.png` (16x16 pixels)
- `assets/favicon/favicon-32x32.png` (32x32 pixels)
- `assets/favicon/apple-touch-icon.png` (180x180 pixels)

### 3. Optimize Images (Recommended)

Current image sizes:
- `quailnavyHD.png`: 207KB
- `quailwhiteHD.png`: 62KB

**Optimize using:**

**Option A: TinyPNG (Free online)**
1. Visit https://tinypng.com
2. Upload both PNG files
3. Download optimized versions
4. Replace files in `assets/images/`

**Option B: Squoosh (Free online)**
1. Visit https://squoosh.app
2. Upload each image
3. Choose "OxiPNG" or "WebP" format
4. Target ~50KB or less per image
5. Download and replace

**Target:** <50KB per logo file

### 4. Create Social Share Image (Optional)

For better social media sharing, create an Open Graph image:

1. Create a 1200x630 pixel image
2. Include your logo and tagline
3. Save as `assets/images/og-image.png`
4. The meta tags already reference this file

### 5. Update Domain URLs (After deployment)

Once you have your domain, update these in `index.html`:
- `og:url` content
- `og:image` URL
- `twitter:image` URL

## Deployment Options

### Netlify (Recommended)

**Option A: Drag & Drop**
1. Visit https://app.netlify.com/drop
2. Drag the entire `Quailworks Website` folder
3. Done! Get your URL.

**Option B: Git Deploy**
1. Push to GitHub/GitLab
2. Connect repo in Netlify dashboard
3. Auto-deploys on every push

**Option C: Netlify CLI**
```bash
npm install -g netlify-cli
cd "Quailworks Website"
netlify deploy --prod
```

### Vercel

```bash
npm install -g vercel
cd "Quailworks Website"
vercel --prod
```

### GitHub Pages

1. Push to GitHub repository
2. Go to Settings > Pages
3. Select branch and root folder
4. Save

## Post-Deployment Verification

After deploying, verify:

- [ ] Site loads correctly
- [ ] All navigation links work
- [ ] Contact form submits successfully
- [ ] Mobile layout looks correct
- [ ] Favicon appears in browser tab
- [ ] Social sharing shows correct preview (use https://cards-dev.twitter.com/validator)

## Custom Domain Setup

To use a custom domain like `quailworks.com`:

1. Purchase domain from registrar
2. In Netlify/Vercel: Add custom domain in settings
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)
5. Update meta tag URLs to use your domain

---

*Deployment guide created: 2026-01-12*
