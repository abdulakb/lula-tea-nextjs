# ⚠️ Important: Live Server Won't Work!

## Why Live Server Doesn't Work

Your Lula Tea website is a **Node.js/Express application**, not a static HTML website. 

**Live Server** only works with static HTML/CSS/JS files. It cannot run:
- Node.js servers
- Express applications
- Backend code with routes and databases
- Server-side rendering (EJS templates)

## ✅ How to Run Your Website Correctly

### Option 1: Use the Batch File (Easiest!)

1. **Close ALL PowerShell/Command Prompt windows**
2. **Double-click**: `START-WEBSITE.bat`
3. Wait for "Lula Tea Server running on http://localhost:3000"
4. Open browser to: http://localhost:3000

### Option 2: Use Terminal Commands

1. **Close this PowerShell window**
2. **Open a NEW PowerShell window** (important!)
3. Run these commands:
   ```powershell
   cd "C:\Users\akbah\Dev\Sandbox-python\Lula Tea"
   npm install
   npm run dev
   ```
4. Open browser to: http://localhost:3000

## 🔄 Why You Need to Restart PowerShell

When you install Node.js, it adds itself to the system PATH, but PowerShell doesn't see it until you:
- Close and reopen PowerShell, OR
- Restart your computer

The current PowerShell window was opened BEFORE you installed Node.js, so it can't find the `node` command.

## 📝 Quick Guide

```
❌ DON'T USE: Live Server button in VS Code
✅ DO USE: npm run dev command or START-WEBSITE.bat file
```

## 🎯 Next Steps

1. **Close ALL terminals/PowerShell windows**
2. **Double-click**: `START-WEBSITE.bat` (in your project folder)
3. **Wait** for the server to start
4. **Open browser**: http://localhost:3000
5. **Enjoy your website!** 🎉

## 🆘 If It Still Doesn't Work

Try restarting your computer. This ensures:
- Node.js is properly registered in PATH
- All environment variables are updated
- PowerShell can find the node command

---

**Remember:** This is a dynamic Node.js application, not a static website! ☕
