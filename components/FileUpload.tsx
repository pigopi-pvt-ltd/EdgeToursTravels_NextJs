'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth';

interface FileUploadProps {
  onUpload: (url: string) => void;
  existingUrl?: string;
  folder?: string;
  label?: string;
  accept?: string;
  buttonClassName?: string;
}

export default function FileUpload({ 
  onUpload, 
  existingUrl = '', 
  folder = 'general', 
  label = 'Upload', 
  accept = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  buttonClassName,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingUrl);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Only images, PDF, and DOC files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = getAuthToken();
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setPreview(data.url);
      onUpload(data.url);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const isImage = preview && (preview.match(/\.(jpeg|jpg|png|gif|webp)$/i) || preview.includes('image'));

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative w-16 h-16 rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {isImage ? (
              <Image 
                src={preview} 
                alt="Preview" 
                fill 
                className="object-cover"
                sizes="64px"   
              />
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 text-center px-1">DOC</span>
            )}
          </div>
        )}
        <label className={`cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium transition ${buttonClassName ?? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'}`}>
          {uploading ? 'Uploading...' : 'Choose File'}
          <input 
            type="file" 
            accept={accept} 
            onChange={handleFileChange} 
            disabled={uploading} 
            className="hidden" 
          />
        </label>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}