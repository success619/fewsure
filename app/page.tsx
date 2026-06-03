import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-white to-gray-100 px-4 py-12">
      <main className="text-center max-w-2xl">
        {/* Badge Component */}
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-6">
          PropTech Ecosystem v16.0
        </span>
        
        {/* Main Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6 leading-tight">
          Real Estate Deal Flow, <br />
          <span className="text-blue-600">Reimagined for Professionals</span>
        </h1>
        
        {/* Value Proposition */}
        <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
          Welcome to the Fewsure Deal Matrix. Securely post, track, and manage complex real estate inventory configurations with lightning-fast cloud delivery.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-all shadow-md text-center"
          >
            Access Platform
          </Link>
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-white text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-all shadow-sm text-center"
          >
            Create Agent Account
          </Link>
        </div>
      </main>

      {/* Footer Meta Details */}
      <footer className="absolute bottom-6 text-xs text-gray-400">
        Candidate Assessment Workspace • Generated via Next.js App Architecture
      </footer>
    </div>
  );
}