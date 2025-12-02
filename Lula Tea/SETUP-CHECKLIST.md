# ✅ Lula Tea Website Setup Checklist

## Current Status: ⚠️ Node.js Not Installed

Follow these steps in order:

---

## Step 1: Install Node.js ⏳

☐ **Download Node.js**
   - Website opened: https://nodejs.org/
   - Click the big green "LTS" button
   - Download the installer (node-v20.x.x-x64.msi)

☐ **Install Node.js**
   - Run the downloaded .msi file
   - Click "Next" → "Next" → "Install"
   - Wait for installation to complete
   - Click "Finish"

☐ **Restart PowerShell**
   - Close all PowerShell windows
   - Open a new PowerShell window

☐ **Verify Installation**
   - Run: `node --version`
   - Should show: v20.x.x or similar
   - Run: `npm --version`
   - Should show: 10.x.x or similar

---

## Step 2: Install Project Dependencies ⏳

☐ **Navigate to Project**
   ```powershell
   cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"
   ```

☐ **Install Dependencies**
   ```powershell
   npm install
   ```
   - This takes 2-5 minutes
   - Wait for it to complete

---

## Step 3: Start the Website ⏳

☐ **Start Server**
   ```powershell
   npm run dev
   ```
   - Should show: "Lula Tea Server running on http://localhost:3000"

☐ **Open in Browser**
   - Go to: http://localhost:3000
   - Website should load! 🎉

---

## Step 4: Add Your Logo (Optional) ⏳

☐ **Save Logo**
   - Save your circular green logo as:
   - `C:\Users\akbah\Dev\Sandbox-python\Lula Tea\public\images\lula-tea-logo.png`

☐ **Refresh Browser**
   - Press F5 in your browser
   - Logo should appear in header!

---

## 🎉 Done!

Once all steps are complete, your Lula Tea website will be:
- ✓ Running locally at http://localhost:3000
- ✓ Showing your beautiful logo
- ✓ Ready for testing and development

---

## Quick Commands

```powershell
# Check if Node.js is installed
node --version

# Go to project folder
cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"

# Install dependencies (first time only)
npm install

# Start website
npm run dev

# Stop website (when running)
Ctrl+C
```

---

## ⏱️ Time Estimate

- Installing Node.js: ~5 minutes
- Installing dependencies: ~3 minutes
- Starting website: ~10 seconds
- **Total: ~10 minutes to get everything running!**

---

## 🆘 Need Help?

If something doesn't work, check:
- `HOW-TO-RUN-WEBSITE.md` - Detailed instructions
- `SETUP.md` - Full setup guide
- Make sure you restarted PowerShell after installing Node.js
