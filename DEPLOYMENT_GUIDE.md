# Master Deployment & Configuration Guide: Google Drive Web App

This guide summarizes all the critical steps, non-intuitive gotchas ("stop places"), and solutions learned during the setup, authorization, and deployment of this Google Drive File Explorer app.

---

## Quick Reference: Configuration & Console Mapping Table

| Component / File | Location / Platform | Primary Purpose | Common Error / Stop Place | Solution |
| :--- | :--- | :--- | :--- | :--- |
| **Authorized Domains** | Firebase Console > Authentication > Settings | Whitelists domains permitted to trigger Google Sign-in popups | `auth/unauthorized-domain` | Add your live deployment domain (Cloud Run URL, GitHub Pages domain, etc.) |
| **OAuth Consent Screen (Test Users)** | Google Cloud Console > APIs & Services > OAuth consent screen | Defines who can access the app while in Testing mode | `Error 403: access_denied` | Add your email to the Test users list or switch to Production mode |
| **OAuth Consent Screen (Branding)** | Google Cloud Console > APIs & Services > OAuth consent screen > Branding | Configures app name, support email, homepage, and privacy policy URLs | Greyed out **"Publish app"** button | Fill in all required fields (App Name, Support Email, Homepage URL, Privacy Policy URL) and click Save |
| **API Library (Drive API)** | Google Cloud Console > APIs & Services > Enabled APIs & Services | Enables Google services for your project ID | `Google Drive API has not been used in project...` | Visit the Google Cloud Console API page for Drive and click **Enable** |
| `firebase-applet-config.json` | Project Root (`/`) | Stores Firebase project credentials (apiKey, projectId, appId, etc.) | App fails to initialize or authentication fails | Ensure config matches your active Firebase project settings |
| `vite.config.ts` | Project Root (`/`) | Configures Vite builder and static asset base paths | Broken asset links on static hosting (GitHub Pages subdirectory) | Set `base: './'` so relative paths resolve correctly |
| `sessionStorage` | Browser Runtime (`sessionStorage`) | Persists OAuth access token across page refreshes | Bouncing back to login screen on browser refresh | Cache `access_token` on successful auth and check on mount |

---

## Part 1: Project Setup & Authentication

### 1. Firebase Authentication Setup
* **What it does:** Manages user sign-in via Google credentials.
* **Non-Intuitive Pitfall (`auth/unauthorized-domain`):** 
  * *The Issue:* When your app runs on a deployed URL (like Cloud Run or GitHub Pages), Firebase blocks sign-in popups by default.
  * *The Fix:* Go to [Firebase Console](https://console.firebase.google.com/) > **Authentication** > **Settings** > **Authorized domains** > click **Add domain** and paste your exact app domain.

### 2. Google Cloud OAuth Consent Screen & Test Users
* **What it does:** Allows users to grant permissions for your app to read/write their Google Drive files.
* **Non-Intuitive Pitfall (`Error 403: access_denied`):**
  * *The Issue:* While your app is in "Testing" mode, any Google account logging in must be explicitly registered as a test user, otherwise Google blocks access.
  * *The Fix:* Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **OAuth consent screen** > scroll to **Test users** > click **+ ADD USERS** and add your email.

### 3. Enabling Required Google APIs
* **What it does:** Grants your project permission to query Google services (like Google Drive).
* **Non-Intuitive Pitfall (`Google Drive API has not been used in project...`):**
  * *The Issue:* Google Cloud projects disable APIs by default. If you try to fetch files without enabling the Drive API, requests fail with a 403 error.
  * *The Fix:* Visit the API library page for your project and click **Enable**:
    `https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=<YOUR_PROJECT_ID>`

### 4. Publishing App for Public / External Users
* **What it does:** Lets any Google user log into your app without test-user restrictions.
* **Non-Intuitive Pitfall (Greyed out "Publish app" button):**
  * *The Issue:* Google requires branding and policy URLs before you can switch from "Testing" to "In Production".
  * *The Fix:*
    1. Go to **OAuth consent screen** > **Branding**.
    2. Fill out App Name, Support Email, **Application Home Page** (your app URL), and **Privacy Policy Link** (your app URL). Click **Save**.
    3. Go to **Audience** > click **Publish app**.

---

## Part 2: Frontend Session Persistence

* **The Issue:** Refreshing the browser previously cleared memory state, bouncing users back to the landing login screen.
* **The Solution:** Cache the OAuth access token in `sessionStorage` so page reloads automatically restore the active session and reload files instantly:
  ```ts
  let cachedAccessToken = sessionStorage.getItem('drive_app_access_token');
  ```

---

## Part 3: GitHub Pages Deployment

### 1. Vite Base Path Configuration
* **The Issue:** Static sites hosted on GitHub Pages are often served under a subdirectory (`/repo-name/`), breaking relative asset links.
* **The Fix:** Add `base: './'` inside `vite.config.ts`:
  ```ts
  export default defineConfig({
    base: './',
    plugins: [react(), tailwindcss()],
  })
  ```

### 2. GitHub Actions Workflow (`.github/workflows/deploy.yml`)
* Automated build and deploy script configured for Node.js 22 and GitHub Pages static artifact upload.

