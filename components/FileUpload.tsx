'use client';

import { useState } from 'react';
import Image from 'next/image';

interface FileUploadProps {
  onUpload: (url: string) => void;
  existingUrl?: string;
  folder?: string;
  label?: string;
  accept?: string;
}

export default function FileUpload({ onUpload, existingUrl = '', folder = 'general', label = 'Upload', accept = 'image/*' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingUrl);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setPreview(data.url);
        onUpload(data.url);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative w-16 h-16 rounded border overflow-hidden">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
        )}
        <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
          {uploading ? 'Uploading...' : 'Choose File'}
          <input type="file" accept={accept} onChange={handleFileChange} disabled={uploading} className="hidden" />
        </label>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}