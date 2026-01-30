import React, { useState } from "react";
import { Button } from "./Button";
import { LoadingSpinner } from "./LoadingSpinner";
import { Icons } from "@/constants";

interface CreateEventFormData {
  name: string;
  description: string;
  instructions: string;
  rewardAmount: number;
  rewardAsset: "SUI";
  imageUrl: string;
  startTime: string; // ISO datetime-local string
  endTime: string;
  maxParticipants: number;
}

interface FormErrors {
  name?: string;
  description?: string;
  instructions?: string;
  rewardAmount?: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: string;
}

interface CreateEventFormProps {
  onCreate: (data: CreateEventFormData) => Promise<void>;
  isLoading?: boolean;
  lifeBalance: number;
}

// Helper to get default datetime (1 hour from now)
const getDefaultStartTime = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  return date.toISOString().slice(0, 16);
};

const getDefaultEndTime = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days from now
  return date.toISOString().slice(0, 16);
};

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onCreate,
  isLoading = false,
  lifeBalance,
}) => {
  const [formData, setFormData] = useState<CreateEventFormData>({
    name: "",
    description: "",
    instructions: "",
    rewardAmount: 1,
    rewardAsset: "SUI",
    imageUrl: "",
    startTime: getDefaultStartTime(),
    endTime: getDefaultEndTime(),
    maxParticipants: 100,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Quest name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.instructions.trim())
      newErrors.instructions = "Instructions are required";
    if (formData.rewardAmount <= 0)
      newErrors.rewardAmount = "Reward must be greater than 0";
    if (formData.maxParticipants <= 0)
      newErrors.maxParticipants = "Max participants must be greater than 0";

    // Validate times
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    const now = new Date();

    if (startDate < now) {
      newErrors.startTime = "Start time must be in the future";
    }
    if (endDate <= startDate) {
      newErrors.endTime = "End time must be after start time";
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Quest image URL is required";
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUrlChange = (url: string) => {
    handleInputChange("imageUrl", url);
    if (url.trim()) {
      try {
        new URL(url);
        setImagePreview(url);
        setErrors((prev) => ({ ...prev, imageUrl: "" }));
      } catch {
        setImagePreview("");
      }
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onCreate(formData);
      setFormData({
        name: "",
        description: "",
        instructions: "",
        rewardAmount: 1,
        rewardAsset: "SUI",
        imageUrl: "",
        startTime: getDefaultStartTime(),
        endTime: getDefaultEndTime(),
        maxParticipants: 100,
      });
      setImagePreview("");
    } catch (error) {
      console.error("Creation failed:", error);
    }
  };

  const handleInputChange = (
    field: keyof CreateEventFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="bg-white backdrop-blur-sm rounded-2xl border border-slate-200 p-8 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Icons.Zap /> Create New Quest
          </h2>
          <p className="text-slate-400 text-sm">
            Create a quest for real-life activities—like attending events,
            joining communities, or completing simple missions with photo proof.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Quest Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent"
              placeholder="e.g. Attend Community Meetup, Visit Local Market"
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent min-h-[80px]"
              placeholder="Describe the real-life activity participants need to complete..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Quest Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) =>
                handleInputChange("instructions", e.target.value)
              }
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent min-h-[100px]"
              placeholder="Step-by-step instructions (e.g. Take a photo at the location, upload to Google Drive, share the link)..."
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-400">{errors.instructions}</p>
            )}
          </div>

          {/* Time Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-400">{errors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-400">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Max Participants & Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) =>
                  handleInputChange(
                    "maxParticipants",
                    parseInt(e.target.value) || 1,
                  )
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent"
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.maxParticipants}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Reward Amount (SUI)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.rewardAmount}
                onChange={(e) =>
                  handleInputChange(
                    "rewardAmount",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent"
              />
              {errors.rewardAmount && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.rewardAmount}
                </p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Quest Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FD6F7] focus:border-transparent"
              placeholder="https://..."
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-400">{errors.imageUrl}</p>
            )}

            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    handleInputChange("imageUrl", "");
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
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
              </div>
            )}
          </div>

          <div className="pt-4">
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-600">Creation Fee:</span>
                <span className="font-mono text-[#6FD6F7]">10 LIFE</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Your Balance:</span>
                <span
                  className={`font-mono ${lifeBalance < 10 ? "text-red-400" : "text-white"}`}
                >
                  {lifeBalance.toFixed(2)} LIFE
                </span>
              </div>
              {lifeBalance < 10 && (
                <p className="text-xs text-red-400 mt-2 bg-red-400/10 p-2 rounded">
                  ⚠️ Insufficient LIFE tokens. You need at least 10 LIFE to
                  create a quest.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || lifeBalance < 10}
              className="w-full bg-[#6FD6F7] hover:bg-[#5BBCE0] text-black font-extrabold uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(111,214,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Creating Quest NFT...</span>
                </div>
              ) : (
                "Create Quest"
              )}
            </Button>
            <p className="text-center text-xs text-slate-500 mt-3">
              * 10 LIFE fee will be burned. Reward SUI will be locked in vault.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
