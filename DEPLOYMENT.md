# Stretchly Extension Deployment Guide

## Deployment Options

### 1. Chrome Web Store (Recommended)
This is the official way to distribute Chrome extensions to users.

#### Prerequisites
- Google Developer account ($5 one-time fee)
- Extension packaged as ZIP file
- Store listing assets (screenshots, descriptions)

#### Steps
1. **Package the extension**
   ```bash
   npm install
   npm run zip
   ```
   This creates a ZIP file in the `dist/` directory.

2. **Create developer account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Pay the one-time $5 registration fee

3. **Upload extension**
   - Click "New Item"
   - Upload the ZIP file from `dist/`
   - Fill in the listing details

4. **Prepare store listing**
   - **Description**: Use the text from manifest.json
   - **Category**: Productivity
   - **Screenshots**: 
     - 1280x800 or 640x400 pixels
     - Show key features (popup, notifications, stretch pages)
   - **Icons**: Already included in the extension
   - **Promotional images**: Optional but recommended

5. **Submit for review**
   - Review typically takes 1-3 business days
   - Fix any policy violations if rejected

### 2. Microsoft Edge Add-ons Store
Edge supports Chrome extensions with minimal changes.

1. **Test in Edge**
   - Load unpacked extension in Edge
   - Verify all features work

2. **Submit to Edge Add-ons**
   - Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
   - Follow similar process as Chrome Web Store

### 3. Self-Hosting (For Testing/Internal Use)

#### Option A: GitHub Releases
1. Create a GitHub repository
2. Create a release with the ZIP file
3. Users download and install manually

#### Option B: Private Web Server
1. Host the `.crx` file on your server
2. Provide installation instructions
3. Note: Chrome restricts installations outside Web Store

### 4. Enterprise Deployment
For organizations using Google Workspace or Microsoft Active Directory:

1. **Package as CRX**
   - Use Chrome to package the extension
   - Generate private key for signing

2. **Deploy via Group Policy**
   - Upload to Google Admin Console
   - Or use Windows Group Policy

## Testing Before Deployment

### Local Testing Checklist
- [ ] Onboarding flow works correctly
- [ ] Notifications appear at set intervals
- [ ] All stretch exercises load with GIFs
- [ ] Timer functionality works
- [ ] Settings save and persist
- [ ] Extension works after browser restart

### Production Checklist
- [ ] Remove console.log statements
- [ ] Verify all image assets load
- [ ] Test on different screen sizes
- [ ] Check memory usage over time
- [ ] Validate manifest.json

## Version Management

1. **Update version in**:
   - `manifest.json`
   - `package.json`

2. **Semantic versioning**:
   - MAJOR.MINOR.PATCH (e.g., 1.0.0)
   - Patch: Bug fixes
   - Minor: New features
   - Major: Breaking changes

## Post-Deployment

### Monitoring
- Check Chrome Web Store developer dashboard for:
  - User reviews and ratings
  - Crash reports
  - Installation statistics

### Updates
1. Fix reported issues
2. Increment version number
3. Create new ZIP package
4. Upload to store
5. Updates auto-install for users

## Privacy Policy & Terms
If collecting any user data, you'll need:
- Privacy Policy URL
- Terms of Service URL

Currently, this extension only uses local storage and doesn't collect personal data.

## Support
Set up a system for user support:
- GitHub Issues
- Email support
- FAQ page

## Quick Deploy Commands

```bash
# Install dependencies
npm install

# Create production package
npm run zip

# Clean build artifacts
npm run clean
```

The packaged extension will be in `dist/stretchly-extension-v1.0.0.zip`