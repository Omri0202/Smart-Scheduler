# 🚀 Deploy Smart Scheduler to GitHub Pages

## Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `smart-scheduler-app`
4. Make it public
5. Click "Create repository"

## Step 2: Upload Files
1. Click "uploading an existing file"
2. Drag all files from your Smart-Scheduler folder
3. Commit with message: "Initial Smart Scheduler PWA"

## Step 3: Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from branch
4. Branch: main
5. Folder: / (root)
6. Click Save

## Step 4: Get Your URL
Your app will be available at:
`https://YOUR_USERNAME.github.io/smart-scheduler-app/`

## Step 5: Update Google OAuth
Add this URL to your Google Console:
- Authorized JavaScript origins: `https://YOUR_USERNAME.github.io`
- Authorized redirect URIs: `https://YOUR_USERNAME.github.io/smart-scheduler-app/`

## Alternative: Use Netlify
1. Go to [netlify.com](https://netlify.com)
2. Drag your Smart-Scheduler folder to Netlify Drop
3. Get instant URL like: `https://amazing-name-123.netlify.app`
4. Add this URL to Google Console

## Quick Fix URLs to Add:
```
https://YOUR_USERNAME.github.io
https://YOUR_NETLIFY_URL.netlify.app
http://localhost:8000
http://127.0.0.1:8000
file://
```
