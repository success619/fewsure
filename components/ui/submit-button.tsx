'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-black text-white py-3 mt-6 rounded-md font-medium hover:bg-gray-800 transition disabled:bg-gray-400 flex justify-center items-center h-12"
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        label
      )}
    </button>
  );
}