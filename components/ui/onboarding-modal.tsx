"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";
import { User, UploadCloud, Loader2 } from "lucide-react";

interface OnboardingModalProps {
  userId: string;
}

export function OnboardingModal({ userId }: OnboardingModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onBoardingHandle = () => {
      if (searchParams.get("onboarding") === "true") {
        return setIsOpen(true);
      }
    };
    onBoardingHandle()
  }, [searchParams]);

  if (!isOpen) return null;

  function closeOnboarding(): void {
    setIsOpen(false);
    router.replace("/dashboard");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG/JPEG).");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  }

  async function handleUpload(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);

      const { error: profileError } = await supabaseClient
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (profileError) throw profileError;

      closeOnboarding();
    } catch (err: unknown) {
      // Type-safe error assertion bypassing the "any" restriction
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected structural asset error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Setup Your Profile
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload an avatar so clients identify your listings instantly.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center relative overflow-hidden group mb-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}

            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs">
              <UploadCloud className="w-4 h-4" />
              <span>Browse</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          <div className="w-full flex flex-col gap-2 mt-4">
            {file ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Profile Image"
                )}
              </button>
            ) : (
              <label className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition cursor-pointer text-center block text-sm">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            <button
              type="button"
              onClick={closeOnboarding}
              disabled={loading}
              className="w-full text-gray-500 py-2 rounded-lg text-sm font-medium hover:text-gray-800 transition"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
