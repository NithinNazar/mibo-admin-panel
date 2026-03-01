import React, { useState, useRef } from "react";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import Input from "./Input";

interface ProfilePictureUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // No file size limit - client wants high quality 4K images

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to backend when endpoint is ready
    // For now, we'll use the data URL as a placeholder
    setUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, this would be:
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/upload/profile-picture', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // onChange(data.url);

      // For now, use data URL
      const dataUrl = reader.result as string;
      onChange(dataUrl);
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewUrl(url);
  };

  const handleClearImage = () => {
    onChange("");
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setUploadMode("url")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === "url"
              ? "bg-miboTeal text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          <LinkIcon size={16} className="inline mr-2" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode("file")}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === "file"
              ? "bg-miboTeal text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          <Upload size={16} className="inline mr-2" />
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === "url" && (
        <Input
          label=""
          type="text"
          placeholder="https://example.com/photo.jpg"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
      )}

      {/* File Upload Mode */}
      {uploadMode === "file" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="profile-picture-upload"
          />
          <label
            htmlFor="profile-picture-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-miboTeal/50 transition-colors bg-slate-700/50"
          >
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miboTeal mx-auto mb-2"></div>
                <p className="text-sm text-slate-400">Uploading...</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-300">Click to upload image</p>
                <p className="text-xs text-slate-400 mt-1">
                  JPEG, PNG, or WebP (High quality 4K supported)
                </p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* Image Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="flex items-center gap-3 p-3 bg-slate-700 border border-slate-600 rounded-lg">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-16 h-16 rounded-full object-cover"
              onError={() => setPreviewUrl("")}
            />
            <div className="flex-1">
              <p className="text-sm text-slate-300">Preview</p>
              <p className="text-xs text-slate-400 truncate">{value}</p>
            </div>
            <button
              type="button"
              onClick={handleClearImage}
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {!previewUrl && (
        <p className="text-xs text-slate-400">
          No image selected. Choose a URL or upload from device.
        </p>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
