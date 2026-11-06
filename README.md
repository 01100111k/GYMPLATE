# GymPlate: Nutrition-Based Food Ordering System for Fitness-Focused Individuals

GymPlate is a commercial web-based ordering platform engineered specifically for athletes, gym-goers, and fitness enthusiasts who require precise macronutrient tracking (Calories, Protein, Carbohydrates, and Fats) for every ordered meal.

The platform provides a unified ecosystem connecting three distinct roles: **Customer**, **Seller**, and **Administrator**, with real-time shared state and synchronized business logic.

---

## 🥗 Core System Features

### 1. Customer Role
- **Macro-Targeted Discovery:** Search and filter meals by exact protein goals (e.g., High Protein 25g+, Low Calorie &le; 350 kcal, Under 500 kcal, custom calorie ranges).
- **Single-Seller Cart Policy:** Enforces bundled ordering per verified commercial kitchen partner to ensure meal freshness and synchronized fulfillment.
- **Checkout Wizard:** Select between Self Pickup or Contact Delivery with Cash on Pickup / Cash on Delivery (COD) payment methods. Duplicate order submission prevention.
- **Live Status Tracking:** Lifecycle timeline (Placed &rarr; Confirmed &rarr; Kitchen Prep &rarr; Ready for Pickup / Out for Delivery &rarr; Completed).
- **Official Digital Receipts:** Printable and downloadable itemized receipts displaying macros, delivery fees, service fees, order numbers, and fulfillment coordinates.
- **Order-Based Nutrition Summary:** Aggregates cumulative calories, protein, carbs, and fat strictly calculated from the customer's GymPlate orders over 1-day, 7-day, 30-day, or all-time windows (with medical/dietary disclaimers).
- **Customer Profile:** Manage delivery addresses, phone coordinates, and account preferences.

### 2. Seller Role
- **Multi-Step Onboarding Wizard:** 5-step registration process requiring account details, representative contact, commercial kitchen information, and uploaded Government Photo ID and Health Department Sanitary Permits.
- **Verification Workflow:** Sellers are assigned compliance states: `Pending Review`, `Approved`, `Rejected`, or `More Info Required`. Product publishing is automatically locked until an Administrator approves the application.
- **Collapsible Sidebar Layout:** Icon-only collapsed state + mobile slide-out drawer.
- **Menu & Macro Management:** Create, edit, and delete fitness meals with realistic food photography, serving size benchmarks, protein/carbs/fat/calories per serving, and stock quantities.
- **Lifecycle Order Dispatch:** Enforces valid transitions (`pending` &rarr; `confirmed` &rarr; `preparing` &rarr; `ready` &rarr; `completed` / `out_for_delivery` &rarr; `delivered`).
- **Inventory & Stock Management:** Prevent overselling with real-time stock deductions upon customer checkout, inline incremental adjustments, low stock alerts (&le; 10 units), and sold-out flags.
- **Sales & Performance Analytics:** Daily, weekly, monthly sales reports, top-selling dishes by volume, and CSV export.
- **Customer Reviews:** View-only verified customer ratings and feedback.
- **Commercial Storefront Profile:** Edit store description, address, phone, and operating hours (edits reflect live across customer marketplace).

### 3. Administrator Role
- **Controlled Access Portal:** Isolated administrative login with no public registration.
- **Seller Compliance Verification:** Inspect applicant details, commercial credentials, and private legal documents (Government ID & Food Sanitation Permit). Actions to Approve, Reject (with mandatory written reason), or Request More Information. Automatic business storefront creation upon approval.
- **Account Governance:** Search, monitor, and suspend/reactivate customer and seller accounts with mandatory justification logging (passwords are never exposed).
- **Product Moderation:** Inspect seller-provided nutritional claims and disable inappropriate dishes with mandatory infraction notes.
- **Platform Order Monitoring:** Read-only surveillance of platform-wide order pipelines across all kitchens.
- **Taxonomy Management:** Manage food categories (Protein Bowls, Salads, Wraps, Smoothies, etc.).
- **Economic Reporting:** Distinguishes Gross Order Value (GMV) from retained Platform Commission Revenue (5% service fee).
- **Audit Activity Logs:** Detailed records of every administrator action with timestamps, targets, and justifications.

---

## 🎨 Design System

- **Primary Color:** Deep Forest Green (`#2D5A3D`, `#245031` hover, `#E8F0EB` light accent).
- **Backgrounds:** Clean white (`#FFFFFF`) and off-white neutral tones (`#FAFAFA`, `#F3F4F6`).
- **Typography:** Charcoal primary headings (`#1A1A1A`), muted gray secondary text (`#6B7280`), clean sans-serif system stack.
- **Icons:** Inline SVG Lucide-style icon component (zero emojis used as icons).
- **Component Geometry:** 6px button/input radius, 8px card radius, 12px modal radius.
- **Modal UX:** Fixed header and close 'X' button; internal scrolling for long receipts and forms; background scrolling prevented when active.
- **Responsive Layout:** Responsive top navigation for Customers, collapsible sidebars for Sellers & Admin with mobile slide-out drawers.

---

## 🔑 Demonstration Accounts

Click the **"Quick Demo Role Switcher"** on the landing page or login screen to auto-fill any of these accounts:

| Role | Email | Password | Status / Access |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@gymplate.com` | `Customer123!` | Active diner (Alex Rivera), order history, nutrition log |
| **Customer 2** | `john@example.com` | `John1234!` | Active diner (John Martinez) |
| **Seller (Approved)** | `seller@gymplate.com` | `Seller123!` | FitFuel Kitchen (Maria Santos), active catalog, order management |
| **Seller (Pending)** | `pending@gymplate.com` | `Pending123!` | Green Bowl Cafe (David Kim), application under review, publishing locked |
| **Seller (Rejected)** | `rejected@gymplate.com` | `Rejected123!` | PowerPlate (Sarah Johnson), rejection reason displayed |
| **Administrator** | `admin@gymplate.com` | `Admin123!` | James Chen, full governance, verification, and audit tools |

---

## 💻 Tech Stack & Architecture

- **Framework:** Angular 22 (Standalone Components, no NgModules)
- **Routing:** Angular Router with role-based and authentication route guards (`customerGuard`, `sellerGuard`, `adminGuard`, `authGuard`, `guestGuard`)
- **State Management:** Angular Signals (`signal`, `computed`), reactive services, shared data service
- **Styling:** Modern modular CSS with CSS Custom Properties, flexbox/CSS grid layouts, zero heavy third-party UI frameworks
- **Persistence:** LocalStorage synchronization for mock state persistence across browser reloads

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ or v20+)
- npm or npx

### Installation & Startup
```bash
# Clone or navigate to the project directory
cd c:\Users\user\OneDrive\Desktop\GYMPLATE_1

# Install dependencies (already installed in workspace)
npm install

# Start the Angular development server
npm start
# OR
npx ng serve
```

Open your browser and navigate to:
```
http://localhost:4200/
```

### Production Build
```bash
npx ng build
```
Compiled output is generated in `dist/gymplate`.

---

## ⚠️ Prototype Scope & Production Backend Requirements

This implementation is a **commercial frontend prototype** with rich simulation and shared mock state:

1. **Authentication:** Uses base64 credential hashing and session IDs stored in `localStorage`. In a real production deployment, this must be replaced with server-side authentication (e.g., Argon2/bcrypt password hashing, short-lived JWT access tokens in HttpOnly cookies, and OAuth2/OIDC providers).
2. **Payment Processing:** Payment methods are restricted to demo Cash on Delivery and Cash on Pickup. Real debit/credit card or bank details are never requested. Production integration would utilize Stripe Connect or PayPal Marketplace with webhook validation.
3. **Document & Media Storage:** Uploaded files and photos use secure image previews and object URLs. Production deployment requires secure S3/Cloud Storage buckets with pre-signed URLs and server-side virus scanning.
4. **Nutrition Disclaimers:** All macronutrient counts are explicitly labeled as seller-provided and not clinical medical advice.
#   G Y M P L A T E  
 