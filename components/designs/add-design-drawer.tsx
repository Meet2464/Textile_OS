"use client"

import { useState } from "react"
import { X, Camera, Upload, AlertCircle } from "lucide-react"
import { useDesigns } from "@/hooks/use-designs"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface AddDesignDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddDesignDrawer({ open, onOpenChange }: AddDesignDrawerProps) {
  const { addDesign, uploadDesignImage } = useDesigns()
  const { appUser } = useAuth()
  const [designNo, setDesignNo] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!designNo.trim()) {
      setError("Design number is required")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadDesignImage(imageFile, designNo.trim())
      }

      const result = await addDesign({
        design_number: designNo.trim(),
        image_url: imageUrl,
        added_by: appUser?.id || null,
      })

      if (result) {
        onOpenChange(false)
        setDesignNo("")
        setImageFile(null)
        setImagePreview(null)
        setError("")
      } else {
        setError("Failed to add design. It may already exist.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6">
      {/* Design No Input */}
      <div className="space-y-2">
        <label htmlFor="designNo" className="text-sm font-medium text-white/80">
          Design Number
        </label>
        <input
          id="designNo"
          type="text"
          placeholder="Enter design number (e.g., DSN-4522)"
          value={designNo}
          onChange={(e) => {
            setDesignNo(e.target.value)
            setError("")
          }}
          className={cn(
            "w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 transition-all",
            error
              ? "border-[#E94560] focus:ring-[#E94560]/50"
              : "border-[#555555] focus:ring-[#FFD700]/50 focus:border-[#FFD700]"
          )}
        />
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-[#E94560]">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium text-white/80">
          Design Image
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative aspect-square rounded-xl border-2 border-dashed transition-all overflow-hidden",
            isDragging
              ? "border-[#FFD700] bg-[#FFD700]/10"
              : "border-[#555555] bg-[#2A2A2A]"
          )}
        >
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-[#1A1A2E] flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-white/50" />
              </div>
              <p className="text-sm font-medium text-white/70">
                Take Photo or Upload Image
              </p>
              <p className="text-xs text-white/40 mt-1">
                Drag & drop or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-auto pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-lg bg-[#FFD700] text-[#1A1A2E] font-semibold hover:bg-[#FFD700]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
          ) : (
            "Add Design"
          )}
        </button>
      </div>
    </form>
  )

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:block hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Desktop Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-[#1A1A2E] border-l border-[#555555] z-50 transform transition-transform duration-300 hidden lg:block",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-[#555555]">
            <h2 className="text-xl font-semibold text-white">Add New Design</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <FormContent />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A2E] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-xl font-semibold text-white">Add New Design</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-0 pb-8">
              <FormContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
