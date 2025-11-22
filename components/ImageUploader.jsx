import { useState, useRef } from 'react';

/**
 * ImageUploader Component
 * Allows multiple image uploads with drag-and-drop support
 * Features: preview, validation, progress tracking
 */
export default function ImageUploader({ onUpload, maxImages = 10, maxSizeMB = 5 }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Validate file
  const validateFile = (file) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: `${file.name} is not an image file` };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `${file.name} exceeds ${maxSizeMB}MB limit` };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);

    // Check total count
    if (files.length + fileArray.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate and process files
    const validFiles = [];
    const newPreviews = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          file,
          preview: reader.result,
          name: file.name,
        });

        if (newPreviews.length === validFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Remove a file from selection
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select images to upload');
      return;
    }

    setUploading(true);
    try {
      await onUpload(files);
      // Clear after successful upload
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-700"
            >
              <span>Upload files</span>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                disabled={uploading}
              />
            </label>
            <span> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to {maxSizeMB}MB (Max {maxImages} images)
          </p>
        </div>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Images ({previews.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.preview}
                  alt={preview.name}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={uploading}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {preview.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </span>
            ) : (
              `Upload ${files.length} Image${files.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
