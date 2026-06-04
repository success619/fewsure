# Adool Technical Assessment: Deal Management Dashboard

A production-grade CRUD web application built to fulfill the technical assessment for the Web Developer position at Adool Construct and Designs Ltd. This application provides a secure, streamlined platform for managing a specific resource: **Deals**.

> ⚠️ **IMPORTANT NOTICE FOR REVIEWERS (DATABASE & SQL):** > This project was developed under a strict **15-hour timebox**. Because setting up the complex, interconnected PostgreSQL schema, foreign keys, and Row Level Security (RLS) policies requires extensive SQL scripting, I have not included a database migration file. 
> 
> Therefore, **you must use the live Supabase instance I have already configured**. The live database linked to these environment variables is the single source of truth for this assessment and will be **deleted in 5 days** from the time of submission for security purposes. Please evaluate the project within this timeframe.

---

## A. How to Set Up and Run Locally

Please follow these steps exactly in order. The environment variables must be configured before starting the development server to ensure the app connects to the pre-configured database.

1. **Make sure you on the right directory after unzipping or cloning the project*

2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables (Required):**
* Locate the `.env.example` file in the root directory.
* Rename `.env.example` to `.env.local` (or copy its contents into a new `.env.local` file).
* Fill in the provided Supabase project credentials (sent securely/separately if not included below).


4. **Run the development server:**
```bash
npm run dev

```


Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser. Unauthenticated users will automatically be redirected to the login page.

***Note**: while you signup you might be asked or have to confirm your email, you will have to check you inbox and confirm...

---

## B. Environment Variables File (`.env.example`)

Your `.env.local` file should look exactly like this to connect to the active 15-hour sprint database:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

```

---

## C. Design Choices, Trade-offs & The 15-Hour Sprint

This application was built from scratch in 15 hours. To deliver a secure, functional product within this tight timeframe, I had to make strategic decisions prioritizing core requirements over auxiliary features:

* **Known Limitations (Likes & Comments):** You will notice UI elements for "Likes" and "Comments" on the Deal feed. **These are non-functional.** Given the 15-hour deadline, I made the deliberate trade-off to strictly focus on making the core requirements—Authentication, Security, and the primary Deals CRUD operations—rock-solid, rather than delivering half-baked social features.
* **Next.js App Router vs. Pages Router:** I utilized the App Router to leverage React Server Components. This keeps the client-side JavaScript bundle minimal and allows for secure, direct-to-database queries from the server.
* **Supabase vs. Custom Backend:** To deliver a secure application rapidly, Supabase was the clear choice. It provides a robust PostgreSQL database and secure authentication natively, drastically reducing backend boilerplate so I could focus on the frontend UI/UX and core business logic.
* **Tailwind CSS:** Used for styling to ensure a clean, responsive design without the overhead, learning curve, or rigid design constraints of heavy component libraries.

---

## D. Deep Dive: Implementation & Technical Details

### 1. Security-First Approach

Security was integrated at the foundation of this build, ensuring a production-grade standard:

* **Row Level Security (RLS):** Enabled directly within the Supabase database. Even if API keys were intercepted, RLS policies guarantee the database will reject any read or write request that does not originate from a verified, authenticated user.
* **XSS Protection:** By utilizing Next.js and React, all user inputs rendered to the DOM are automatically escaped, heavily mitigating Cross-Site Scripting (XSS) vulnerabilities.
* **Secret Management:** Database mutations happen securely on the server, ensuring sensitive service roles or deep database logic are never exposed to the client browser.

### 2. User Authentication

Authentication is strictly enforced using **Supabase Auth**.

* **Flow:** Users can securely sign up, log in, and log out.
* **Protection (Middleware):** A Next.js `proxy.ts` file acts as the gatekeeper. It intercepts every request and checks for a valid session token. If an unauthenticated user attempts to access the main Deals dashboard or any protected route, the middleware instantly redirects them to `/login`.

### 3. CRUD Operations (Resource: Deals)

Authenticated users have full control over the **Deals** resource, fulfilling the primary assessment requirement.

* **Create (C):** Users can add new deals via a form interface (managing fields like Title, Description, Status, etc.).
* **Read (R):** The dashboard displays a feed of all deals. Data is fetched on the server side for immediate availability on page load without client-side loading spinners, improving performance and UX.
* **Update (U) & Delete (D):** Users can seamlessly modify existing deal information or permanently remove their deals from the database.

### 4. Next.js Server Actions

Instead of building traditional API routes (`/api/deals`) and managing complex client-side fetching logic, this application leverages Next.js Server Actions.

* **How it works:** When a user submits a form to create, update, or delete a deal, the action directly invokes an asynchronous function that executes *only on the server*.
* **Benefits:** This eliminates the need for heavy client-side state management (like Redux or React Query). After a database mutation, `revalidatePath` is called to instantly clear the Next.js cache and reflect the updated data in the UI without a full page refresh.

### 5. Error Handling

* **Server-Side Validation:** All database operations are wrapped in `try/catch` blocks on the server.
* **User Feedback:** If an operation fails (e.g., duplicate email during sign-up, or a failed database update), the Server Action returns a specific error object. The UI captures this state and displays clear, human-readable error messages to the user, ensuring the system state is always transparent.
*