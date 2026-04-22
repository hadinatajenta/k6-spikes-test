# Vercel Deployment Guide

## ⚠️ Important Note

**Vercel is NOT ideal for k6 load testing** because:
- ❌ Serverless (timeout ~60 seconds)
- ❌ No persistent storage
- ❌ Pay-per-execution
- ❌ Long-running tests will timeout

**Better alternatives:**
- ✅ GitHub Actions (current setup)
- ✅ Railway.app
- ✅ Docker on VPS
- ✅ K6 Cloud

---

## If You Still Want to Deploy to Vercel

### Step 1: Set Up Vercel Secrets

```bash
# Get your credentials from Vercel
gh secret set VERCEL_TOKEN --body "your_vercel_token_here"
gh secret set VERCEL_ORG_ID --body "your_org_id_here"
gh secret set VERCEL_PROJECT_ID --body "your_project_id_here"
```

**How to get credentials:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and set as VERCEL_TOKEN

4. Go to https://vercel.com/dashboard
5. Select project
6. Settings → General
7. Copy Project ID and Org ID

### Step 2: Push to Trigger Deployment

```bash
git add .
git commit -m "Add Vercel deployment workflow"
git push origin main
```

Workflow akan trigger otomatis!

### Step 3: View Deployment

- Go to Actions tab
- Check "Deploy to Vercel"
- See deployment link

---

## Recommended: Use GitHub Actions Instead

**Our current setup is much better for k6 testing:**

```bash
# Run k6 test via GitHub Actions (recommended)
gh workflow run k6-load-test.yml

# Or schedule automatically (no manual needed)
# Edit .github/workflows/k6-load-test.yml
on:
  schedule:
    - cron: '0 2 * * *'
```

---

## Vercel Use Cases (If Really Needed)

**Use Vercel for:**
- Hosting k6 dashboard UI (not the actual test)
- Storing historical results
- Custom reporting interface

**Don't use Vercel for:**
- ❌ Running actual load tests
- ❌ Long-running processes
- ❌ High-frequency testing

---

## Alternative: Railway.app (Better Option)

Railway is better for k6 than Vercel:

```bash
# 1. Sign up: https://railway.app
# 2. Connect GitHub
# 3. Select this repo
# 4. Deploy!

# Railway supports:
# ✅ Docker containers
# ✅ Long-running processes
# ✅ Better pricing for this use case
# ✅ Environment variables
```

---

**Recommendation:** Stick with GitHub Actions workflow. It's free, reliable, and perfect for k6 testing! ✅
