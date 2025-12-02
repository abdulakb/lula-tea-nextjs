# 🚀 How to Run Your Lula Tea Website

## ⚠️ Node.js is Not Installed

The website needs Node.js to run, but it's not currently installed on your system.

## 📥 Step 1: Install Node.js

### Option A: Download and Install (Recommended)

1. **Go to the Node.js website:**
   - Visit: https://nodejs.org/
   - You'll see two download buttons

2. **Download the LTS version:**
   - Click the **"LTS"** (Long Term Support) button
   - This is the stable, recommended version
   - File will be something like: `node-v20.x.x-x64.msi`

3. **Run the installer:**
   - Double-click the downloaded `.msi` file
   - Click "Next" through the installation wizard
   - Accept the license agreement
   - Keep all default settings (including "Add to PATH")
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

4. **Restart your terminal:**
   - Close all PowerShell/Command Prompt windows
   - Open a new PowerShell window

### Option B: Using Winget (Windows 11)

If you have Windows 11, you can install via command:

```powershell
winget install OpenJS.NodeJS.LTS
```

Then restart your terminal.

## ✅ Step 2: Verify Installation

After installing Node.js, open a NEW PowerShell window and run:

```powershell
node --version
npm --version
```

You should see version numbers like:
```
v20.10.0
10.2.3
```

## 📦 Step 3: Install Project Dependencies

Navigate to your project folder and install dependencies:

```powershell
cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"
npm install
```

This will take a few minutes and install all required packages.

## 🎯 Step 4: Start the Website

After dependencies are installed, start the server:

```powershell
npm run dev
```

You should see:
```
Lula Tea Server running on http://localhost:3000
```

## 🌐 Step 5: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

Your website should now be running! 🎉

## 🔧 Troubleshooting

### If "npm install" fails:
- Make sure you restarted PowerShell after installing Node.js
- Try running PowerShell as Administrator
- Delete `node_modules` folder if it exists, then try again

### If port 3000 is busy:
Edit the `.env` file and change:
```
PORT=3000
```
to:
```
PORT=3001
```

Then try again.

### If you see permission errors:
Run PowerShell as Administrator:
- Right-click PowerShell icon
- Select "Run as Administrator"
- Navigate to project folder
- Run `npm install` again

## 📋 Quick Command Reference

```powershell
# Check Node.js is installed
node --version

# Navigate to project
cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"

# Install dependencies (only needed once)
npm install

# Start the website (development mode with auto-restart)
npm run dev

# OR start in production mode
npm start

# Stop the server
Press Ctrl+C in the terminal
```

## 🎨 Don't Forget Your Logo!

After the website is running, add your logo:
1. Save your logo as: `public/images/lula-tea-logo.png`
2. Refresh the browser
3. Your logo will appear!

## 📞 Need More Help?

Check these files in your project:
- `SETUP.md` - Detailed setup guide
- `QUICKSTART.md` - Quick start guide
- `README.md` - Project overview

---

**After installing Node.js, the website will work perfectly!** ☕✨
