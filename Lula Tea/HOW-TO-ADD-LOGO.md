# How to Add Your Logo to the Website

## Quick Steps:

1. **Save the logo image** (the circular green logo with ولول lula TEA text) as:
   ```
   C:\Users\akbah\Dev\Sandbox-python\Lula Tea\public\images\lula-tea-logo.png
   ```

2. **For the favicon** (browser tab icon), create a smaller version (32x32 or 64x64 pixels) and save as:
   ```
   C:\Users\akbah\Dev\Sandbox-python\Lula Tea\public\images\favicon.png
   ```

## The website is already configured!

The HTML and CSS have been updated to:
- Display your logo image in the header
- Show your logo in the mobile menu
- Use the favicon in browser tabs
- Automatically fall back to the tea cup icon if the image isn't found

## How it works:

- When `lula-tea-logo.png` exists → Shows your beautiful circular logo
- When image doesn't exist → Shows tea cup icon + "Lula Tea" text (fallback)

## File locations:

Your logo should be saved here:
```
Lula Tea/
└── public/
    └── images/
        ├── lula-tea-logo.png   ← Main logo (save here!)
        └── favicon.png         ← Browser icon (optional)
```

## Logo specifications:

Based on the image you provided:
- **Format**: PNG with transparent background (recommended) or JPG
- **Size**: 200-400px width (height auto-adjusts to 60px in header)
- **Design**: Circular logo with dark green background
- **Text**: ولول lula / TEA

Just save your logo file with the exact name `lula-tea-logo.png` in the `public/images/` folder and refresh the website - it will appear automatically!
