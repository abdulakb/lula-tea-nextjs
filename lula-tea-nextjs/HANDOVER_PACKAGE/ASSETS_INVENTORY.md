# 🎨 Lula Tea - Assets Inventory

Complete list of all images, logos, and design files used in the website.

---

## 📁 File Locations

### Logo & Branding

#### Main Logo
```
Location: /public/icons/
Files:
  - icon.svg          (Vector logo, scalable)
  - icon-192.png      (192x192px for mobile)
  - icon-512.png      (512x512px for desktop/PWA)
  - favicon.ico       (Browser tab icon)
```

**Usage:**
- Website header
- Browser tab
- Mobile app icon
- Social media profiles
- Marketing materials

**Design Details:**
- Circular green logo with tea leaf motif
- Brand colors: Tea green (#769C7C) on warm cream background
- Style: Natural, organic, handcrafted feel

---

### Product Images

#### Main Product Photo
```
Location: /public/images/Product Image2.jpg

Dimensions: [Actual dimensions]
Format: JPEG
Usage: Homepage, product page, checkout
Shows: Premium Loose Leaf Tea packaging
```

**Backup/Alternative Images:**
```
/public/images/Product Image.jpg (if exists)
/public/images/product-alt1.jpg (if exists)
```

---

### QR Codes

#### WhatsApp Business QR Code
```
Location: /public/images/whatsapp-barcode.jpg

Purpose: Direct link to WhatsApp chat
Linked to: +966539666654
Usage: Checkout page, Contact page
Format: JPEG/PNG
```

**How to Update:**
1. Open WhatsApp Business on phone
2. Settings → Business Tools → QR Code
3. Save/Screenshot QR code
4. Replace file at `/public/images/whatsapp-barcode.jpg`
5. Test by scanning with phone

#### STC Pay QR Code
```
Location: /public/images/stc-qr-code.jpg

Purpose: Receive payments via STC Pay
Linked to: [Owner's STC Pay account]
Usage: Checkout page (STC Pay payment option)
Format: JPEG/PNG
```

**How to Update:**
1. Open STC Pay app
2. Go to "Receive Money" → "QR Code"
3. Save QR code image
4. Replace file at `/public/images/stc-qr-code.jpg`
5. Test by scanning and sending small amount

---

### Icons & Favicons

```
Location: /public/icons/

Files:
  icon.svg         - SVG version (scalable)
  icon-192.png     - PWA icon (mobile)
  icon-512.png     - PWA icon (desktop)
  favicon.ico      - Browser favicon

Manifest File: /public/manifest.json
```

**Manifest.json Configuration:**
```json
{
  "name": "Lula Tea",
  "short_name": "Lula",
  "description": "Premium Loose Leaf Tea",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🎨 Brand Guidelines

### Color Palette

#### Primary Colors
```css
Tea Green:    #769C7C  (rgb(118, 156, 124))
Deep Brown:   #3E2723  (rgb(62, 39, 35))
Tea Brown:    #6D4C41  (rgb(109, 76, 65))
Warm Cream:   #FFF8E1  (rgb(255, 248, 225))
```

#### Usage:
- **Tea Green** - Primary buttons, accents, highlights
- **Deep Brown** - Main text, headings
- **Tea Brown** - Secondary text, descriptions
- **Warm Cream** - Backgrounds, cards

#### Dark Mode Colors
```css
Gray-900:  #111827  (Dark background)
Gray-800:  #1F2937  (Card background)
Gray-700:  #374151  (Borders)
```

### Typography

#### Fonts Used
```css
Font Family: System font stack
Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...

Font Sizes:
  - Headings: text-3xl (30px), text-2xl (24px)
  - Body: text-base (16px)
  - Small: text-sm (14px), text-xs (12px)

Font Weights:
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700
```

#### Arabic Font Support
- Native system Arabic fonts
- RTL (right-to-left) layout support
- All text fully translated

---

## 📐 Image Specifications

### Product Images
**Recommended:**
- Format: JPEG or WebP
- Dimensions: Minimum 1200x1200px
- Aspect Ratio: 1:1 (square) or 4:3
- File Size: < 500KB (optimized)
- Quality: 80-90%

**Current:**
- Using Next.js Image component (automatic optimization)
- Lazy loading enabled
- Responsive sizing

### QR Codes
**Requirements:**
- Format: PNG or JPEG
- Minimum Size: 500x500px
- Background: White
- Quiet Zone: Adequate margin around QR
- Test: Must scan successfully

### Logos/Icons
**Requirements:**
- SVG preferred (scalable)
- PNG fallback with transparency
- Minimum sizes:
  - 192x192px (mobile)
  - 512x512px (desktop)
- ICO for favicon (16x16, 32x32, 48x48)

---

## 🖼️ Missing/Future Assets

### Recommended Additions

#### 1. **Product Lifestyle Photos**
```
Suggested:
  - Tea brewing process
  - Cup of brewed tea
  - Tea with accompaniments (biscuits, etc.)
  - Packaging close-up
  - Ingredients/tea leaves

Purpose: Instagram, marketing, email campaigns
```

#### 2. **Social Media Assets**
```
Needed:
  - Instagram profile picture (1:1)
  - Instagram posts (1080x1080)
  - Instagram stories (1080x1920)
  - Facebook cover (820x312)
  - Twitter header (1500x500)
```

#### 3. **Promotional Graphics**
```
Ideas:
  - Sale banners
  - Seasonal campaigns
  - Free delivery badges
  - Customer testimonials
  - Product comparison charts
```

#### 4. **Email Templates**
```
Graphics for:
  - Order confirmation header
  - Promotional campaigns
  - Newsletter header
  - Signature logo
```

---

## 🔄 Asset Update Process

### When to Update Assets

#### QR Codes
- WhatsApp number changes
- STC Pay account changes
- QR code stops working

#### Product Images
- New product added
- Packaging redesign
- Seasonal variants
- Better quality photo available

#### Logo/Branding
- Rebranding
- Logo refresh
- New marketing campaign

### How to Update

#### 1. **Replace Image File**
```bash
# Navigate to project
cd lula-tea-nextjs

# Replace file in public folder
# Example: Replace product image
cp /path/to/new/image.jpg public/images/Product Image2.jpg

# Commit change
git add public/images/
git commit -m "Update product image"
git push
```

#### 2. **Clear Cache (if needed)**
```bash
# Vercel will automatically rebuild
# Next.js Image component will re-optimize
```

#### 3. **Test**
- View on website
- Check mobile and desktop
- Test QR codes by scanning
- Verify image loads properly

---

## 📦 Asset Backup

### Current Backup Locations

#### Git Repository
```
All assets in /public/ folder are version-controlled
GitHub: https://github.com/abdulakb/lula-tea-nextjs
```

#### Recommended Additional Backups
```
1. Cloud Storage (Google Drive, Dropbox)
   - Create "Lula Tea Assets" folder
   - Include original high-res files
   - Include source files (PSD, AI, Figma)

2. Local Backup
   - External hard drive
   - Organized folder structure
   - Include originals and exports

3. Design Tools
   - Keep source files in Figma/Photoshop
   - Export versions as needed
```

### Backup Schedule
- **After every change**
- **Monthly full backup**
- **Before major redesigns**

---

## 🎯 Asset Checklist for New Products

When adding a new product, ensure you have:

- [ ] Main product photo (1200x1200+)
- [ ] Multiple angles (optional but recommended)
- [ ] Lifestyle photo (in use context)
- [ ] Packaging photo
- [ ] Ingredients/details photo
- [ ] Mobile-optimized versions
- [ ] Alt text descriptions (for SEO and accessibility)
- [ ] Product added to database
- [ ] Images uploaded to `/public/images/`

---

## 📱 Social Media Assets (Current)

### Existing Presence
**WhatsApp Business:**
- Number: +966539666654
- Profile: Business account
- QR Code: Available in `/public/images/`

### Future Channels
- Instagram: [@lulatee] (TBD)
- Facebook: [Page name] (TBD)
- Twitter/X: [@lulatee] (TBD)

---

## 🔍 SEO & Metadata

### Open Graph Images
```html
<!-- Current implementation in layout.tsx -->
<meta property="og:image" content="/images/Product Image2.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

**Recommended OG Image:**
- Size: 1200x630px
- Format: JPEG or PNG
- Includes: Logo + product + text overlay
- File: `/public/images/og-image.jpg`

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/images/og-image.jpg" />
```

---

## 🛠️ Tools & Resources

### Image Editing
**Free Tools:**
- Photopea (online Photoshop alternative)
- Canva (graphics and social media)
- GIMP (desktop editor)
- Figma (UI design)

**Compression:**
- TinyPNG.com (PNG compression)
- JPEG-Optimizer.com (JPEG compression)
- Squoosh.app (Google's image compressor)

### QR Code Generators
**If you need to regenerate:**
- qr-code-generator.com
- qrcode-monkey.com
- Or use native apps (WhatsApp, STC Pay)

### Logo Design
**If redesigning:**
- Canva Pro (templates available)
- Fiverr (hire designer)
- 99designs (design contests)

---

**Document Version:** 1.0  
**Last Updated:** December 4, 2025  
**Assets Count:** 
- Logos: 4 files
- Product Images: 1 main
- QR Codes: 2 files
- Total: 7+ assets
