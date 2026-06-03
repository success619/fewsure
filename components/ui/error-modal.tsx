'use client';

import { useRouter, usePathname } from 'next/navigation';
import { XCircle, X } from 'lucide-react';

export function ErrorModal({ error }: { error?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // If there is no error, do not render the modal at all
  if (!error) return null;

  function closeModal() {
    // Replaces the current URL with the clean pathname, removing the ?error query
    router.replace(pathname);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <h3 className="font-bold">Authentication Error</h3>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-gray-600 text-sm leading-relaxed">
          {error}
        </div>

        <div className="bg-gray-50 p-4 flex justify-end">
          <button 
            onClick={closeModal} 
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100 transition"
          >
            Dismiss
          </button>
        </div>
        
      </div>
    </div>
  );
}