# 🌺 ShaadiSutra — Indian Wedding Planning Platform

A modern, culturally tailored wedding planning web application built for Indian weddings (multi-day ceremonies, complex guest side logistics, vendor coordination, shagun ledger, and accommodations).

Designed for seamless deployment to **Vercel** with **Google Firebase** backend integration.

- 🚀 **Live Production Site**: [https://shaadi-planner-omega.vercel.app](https://shaadi-planner-omega.vercel.app)
- 🐙 **GitHub Repository**: [https://github.com/sbehera309/shaadi-planner](https://github.com/sbehera309/shaadi-planner)

---

## 🌟 Key Features

1. **Multi-Event Itinerary & Muhurat Planner**
   - Manage multi-day rituals: Roka, Mehendi, Haldi, Sangeet, Shubh Vivah (Pheras / Mandap), Baraat, Reception.
   - Auspicious muhurat badges, run-of-show steps, dress code color themes, and family coordinator phone numbers.

2. **Guest List & Sub-Event RSVPs**
   - Categorize by **Ladkewale (Groom's side)** vs **Ladkiwale (Bride's side)** vs Mutual.
   - Filter by cultural & dietary restrictions: **Jain (No Root Veg)**, **Strict Vegetarian**, **Swaminarayan**, **Halal**, etc.
   - Track adult + child headcounts and sub-event RSVP status.
   - One-click CSV Export.

3. **Family Budget & Split Tracker**
   - Side-wise expense sharing: Bride's family, Groom's family, 50-50 shared split, and couple.
   - Tracks estimated vs actual costs, advances paid, and balance due dates.

4. **Vendor Directory & Contracts**
   - Professional CRM for Pandit Ji (samagri lists), Bridal Mehendi artists, Bridal MUA & Hair stylists, Photographers, Choreographers & DJs.
   - Track contract deliverables, agreed fees, and deposits.

5. **Traditional Shagun & Lifafa (Gift) Ledger**
   - Log cash envelopes (₹ Lifafas), 24K gold/silver coins, and wedding gifts.
   - Reciprocity tracker: Record past family gift exchanges ("They gave ₹11,000 at Rohit's wedding").
   - One-click Thank-you note dispatch tracker.

6. **Hotel Rooms & Transit Logistics**
   - Hotel room inventory blocks, family allocations, and check-in/out dates.
   - Airport and railway arrival pickup lists for guests.

7. **Public-Facing Guest Invitation Website (`/invite/[weddingSlug]`)**
   - Mobile-responsive digital invitation with auspicious slokas, countdown clock, and couple's story.
   - Interactive ceremony itinerary with venue directions and dress code guide.
   - Digital RSVP form allowing guests to submit family headcounts, diets, and blessings.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with Royal Indian Wedding Palette (Crimson, Marigold, Royal Gold, Emerald, Ivory)
- **Icons**: Lucide React
- **Backend / DB**: Google Firebase (Authentication & Cloud Firestore) with LocalStorage fallback for instant preview
- **Hosting**: Vercel (Git push continuous deployment)

---

## 🚀 Getting Started

### 1. Install & Run Locally

```bash
# Clone or navigate to the project directory
cd /Users/sandeepbehera/.gemini/antigravity/scratch/shaadi-planner

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser:
- **Planner Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Guest Portal**: [http://localhost:3000/invite/aarav-weds-ananya](http://localhost:3000/invite/aarav-weds-ananya)

---

## ☁️ Connecting to Firebase

The app works instantly with rich local demo data out of the box. To link your live Firebase backend:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database** in test mode or production mode.
3. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Fill in your project credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   ```

---

## 🚢 Deploying to Vercel via Git

1. Initialize git (if not already done) and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ShaadiSutra Wedding Planning App"
   ```
2. Create a repository on GitHub / GitLab.
3. Push to your repository:
   ```bash
   git remote add origin https://github.com/your-username/shaadi-planner.git
   git branch -M main
   git push -u origin main
   ```
4. Connect to Vercel:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Import your GitHub repository.
   - (Optional) Add your Firebase environment variables under **Project Settings > Environment Variables**.
   - Click **Deploy**! Future `git push` commands will automatically trigger production deployments.
