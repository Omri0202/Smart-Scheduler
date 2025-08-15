# Bug Fixing Plan - 2024-08-15

## Current Issues
1. Corrupted JavaScript files (app.js and others)
2. Missing CSS file reference
3. Environment variables not properly loaded
4. Module export/import issues

## Step-by-Step Plan

### Phase 1: Fix File Corruption
1. [ ] Backup current project state
   ```bash
   git add .
   git commit -m "Backup before fixing corrupted files"
   git push origin current-branch
   ```

2. [ ] Restore clean versions of corrupted files from main branch
   ```bash
   git checkout main -- src/js/app.js
   git checkout main -- src/js/ui-utils.js
   git checkout main -- src/js/voice-recognition.js
   git checkout main -- src/js/google-api.js
   ```

3. [ ] Verify file integrity
   - Check each file for corruption
   - Ensure proper exports/imports

### Phase 2: Fix CSS Reference
1. [ ] Verify CSS file exists at `/src/css/styles.css`
2. [ ] Update HTML to reference correct CSS path
3. [ ] Test CSS loading

### Phase 3: Environment Variables
1. [ ] Create/verify `.env` file with required variables:
   ```
   VITE_GOOGLE_API_KEY=your_api_key_here
   VITE_GOOGLE_CLIENT_ID=251900786787-rs2a373jkaetk9lmh49nch3tq5p3lnhp.apps.googleusercontent.com
   VITE_GOOGLE_DISCOVERY_DOCS=https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest
   VITE_GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar.events
   VITE_DEBUG_MODE=true
   ```

2. [ ] Verify environment variables are loaded in the application

### Phase 4: Testing
1. [ ] Start development server
   ```bash
   npm run dev
   ```
2. [ ] Test basic functionality
   - Page loads without errors
   - CSS is applied correctly
   - Google API initializes
   - Voice recognition works

## Verification Steps
- [ ] No console errors in browser
- [ ] All UI elements render correctly
- [ ] Google authentication works
- [ ] Voice input/output functions

## Rollback Plan
If issues persist:
1. Revert to the backup commit
2. Document the specific error
3. Create a new branch for debugging

## Notes
- Always test changes in small increments
- Commit after each successful step
- Document any new issues found during testing
