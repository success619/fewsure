import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SubmitButton } from "@/components/ui/submit-button";
import { ErrorModal } from "@/components/ui/error-modal";

export default async function SignupPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;

  async function signUp(formData: FormData) {
    "use server";
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    // Pass the full name into the user_metadata object safely
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/dashboard?onboarding=true");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Reusable modal catches and cleanly clears registration errors */}
      <ErrorModal error={searchParams?.error} />

      <form
        action={signUp}
        className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-200"
      >
        <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
          Create an Account
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Join the Fewsure Deal Matrix
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="fullName"
              type="text"
              placeholder="e.g. John Doe"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
        </div>

        {/* Reusable loading button matches your custom client states */}
        <SubmitButton label="Register Account" />

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
