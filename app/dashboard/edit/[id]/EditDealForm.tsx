"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertTriangle,
  Save,
  Loader2,
  UploadCloud,
  X,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { updateDealAction, deleteDealAction } from "./actions";
import { supabaseClient as supabase } from '@/lib/supabase-client';

interface EditDealFormProps {
  deal: {
    id: string;
    user_id?: string;
    title?: string;
    description?: string;
    deal_type?: string;
    created_at?: string;
    image_urls?: string[];
    price?: number;
  };
}

export default function EditDealForm({ deal }: EditDealFormProps) {
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingImages, setExistingImages] = useState<string[]>(
    Array.isArray(deal.image_urls) ? deal.image_urls : []
  );

  const [newImages, setNewImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: deal.title || "",
    description: deal.description || "",
    price: deal.price || 0,
  });

  const handleRemoveExistingImage = (urlToRemove: string) => {
    setError(null);
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
    setImagesToDelete((prev) => [...prev, urlToRemove]);
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setError(null);
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploadingImage(true);
    
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${deal.id}-edit-${Date.now()}-${i}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("deals")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("deals").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setNewImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload new images.");
    } finally {
      setUploadingImage(false);
      e.target.value = ''; 
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    
    try {
      const finalImagesArray = [...existingImages, ...newImages];
      
      await updateDealAction(deal.id, { 
        title: formData.title,
        description: formData.description,
        price: formData.price,
        image_urls: finalImagesArray, 
        imagesToDelete 
      });
      
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "An error occurred while saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    
    try {
      await deleteDealAction(deal.id);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete listing.");
      setShowDeleteConfirm(false); 
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="p-6 space-y-6">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start shadow-sm transition-all animate-in fade-in">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">System Error</h3>
            <p className="text-sm text-red-600/90">{error}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
        
        <div>
          <label className="flex items-center text-sm font-bold text-gray-900 mb-3">
            <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
            Active Deal Images ({existingImages.length})
          </label>
          
          {existingImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {existingImages.map((url) => (
                <div
                  key={url}
                  className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={url} 
                    alt="Active deal asset" 
                    className="w-full h-full object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-md shadow-md transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                    title="Delete image asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic bg-white p-4 border border-gray-200 rounded-lg shadow-inner">
              No images are currently mapped to this deal.
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        <div>
          <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
            Upload Additional Photos
          </label>

          {newImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {newImages.map((url, index) => (
                <div
                  key={url + index}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 border-blue-200 bg-blue-50 group shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Staged photo option" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">Staged</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-600 text-white p-1.5 rounded-md shadow transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition relative">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Staging files...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to select more files</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP formats supported</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Property Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          rows={4}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Price
        </label>
        <div className="relative">
          <span className="absolute left-4 top-2 text-gray-500 font-medium">
            $
          </span>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            required
            className="w-full pl-8 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
          />
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-200">
        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center text-red-600 hover:text-red-700 font-semibold text-sm transition px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Deal
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex items-center px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition shadow-sm disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2 shrink-0 text-red-600" />
              <span className="text-sm font-medium">
                Are you completely sure you want to remove this entire deal entry?
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-sm flex-1 sm:flex-none flex justify-center items-center"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Yes, Delete Entry"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}