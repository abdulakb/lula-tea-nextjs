# 🔧 Troubleshooting: Window Closes Immediately

## Why This Happens

When you double-click `START-WEBSITE.bat` and it closes immediately, it means:
- Node.js is installed BUT Windows doesn't recognize it yet
- This is NORMAL after installing new software
- **Solution: Restart your computer**

## 🔄 SOLUTION: Restart Your Computer

After installing Node.js, you MUST restart your computer because:
1. Node.js adds itself to Windows PATH
2. Windows needs to reload this PATH
3. Until restarted, the `node` command won't work

### Steps:

1. **Save all your work**
2. **Restart your computer** (not just sign out)
3. After restarting, double-click `START-WEBSITE.bat` again
4. It will work! 🎉

## 🧪 Test if Node.js is Working

Before restarting, you can test:

**Double-click**: `TEST-NODEJS.bat` (in your project folder)

This will tell you if:
- ✅ Node.js is working → You can start the website
- ❌ Node.js is not found → Restart your computer

## 📋 Alternative: Manual Method

If you prefer not to restart right now, you can run the website manually:

### Option 1: Using PowerShell (AS ADMINISTRATOR)

1. **Close ALL PowerShell windows**
2. **Right-click PowerShell** → Select "Run as Administrator"
3. Run:
   ```powershell
   cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"
   
   # Refresh PATH
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   
   # Test Node
   node --version
   
   # Install dependencies
   npm install
   
   # Start website
   npm run dev
   ```

### Option 2: Using Command Prompt (AS ADMINISTRATOR)

1. **Close ALL Command Prompt windows**
2. Search for "Command Prompt"
3. **Right-click** → "Run as Administrator"
4. Run:
   ```cmd
   cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"
   refreshenv
   node --version
   npm install
   npm run dev
   ```

## ⚡ Quick Fix Summary

```
Problem: START-WEBSITE.bat closes immediately
Reason:  Windows hasn't loaded Node.js PATH yet
Solution: Restart your computer

After restart → Double-click START-WEBSITE.bat → Website starts! ✨
```

## 🎯 What Happens After Restart

1. Windows recognizes Node.js
2. `START-WEBSITE.bat` can find the `node` command
3. Dependencies get installed automatically
4. Server starts
5. You see: "Lula Tea Server running on http://localhost:3000"
6. Open browser → http://localhost:3000 → Website works! 🎉

## 🆘 Still Having Issues?

### Check if Node.js is Actually Installed

1. Go to: `C:\Program Files\nodejs\`
2. Look for: `node.exe`
3. If it's there, Node.js is installed → Just need to restart
4. If it's not there, reinstall Node.js from https://nodejs.org/

### Verify Installation Path

Node.js should be installed in one of these locations:
- `C:\Program Files\nodejs\`
- `C:\Program Files (x86)\nodejs\`

---

## 💡 Recommended Solution

**Just restart your computer!** It's the fastest and most reliable solution. ⚡

After restart:
1. Double-click `TEST-NODEJS.bat` to verify (optional)
2. Double-click `START-WEBSITE.bat` to start website
3. Open http://localhost:3000
4. Enjoy your website! ☕✨
