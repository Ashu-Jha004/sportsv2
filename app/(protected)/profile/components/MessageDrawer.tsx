"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { Send, Image as ImageIcon, X } from "lucide-react";

interface MessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  receiverUsername: string | "" | undefined;
  receiverName: string;
}

export function MessageDrawer({
  isOpen,
  onClose,
  receiverUsername,
  receiverName,
}: MessageDrawerProps) {
  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Handle image upload to Cloudinary
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );
      formData.append(
        "folder",
        `messages/${new Date().toISOString().split("T")[0]}`
      );

      console.log(`📤 [MessageDrawer] Uploading image to Cloudinary...`);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      setUploadedImageUrl(res.data.secure_url);
      toast.success("Image uploaded successfully!");
      console.log(`✅ [MessageDrawer] Image uploaded:`, res.data.secure_url);
    } catch (err: any) {
      toast.error("Image upload failed. Please try again.");
      console.error(`❌ [MessageDrawer] Image upload error:`, err.message, err);
    } finally {
      setUploading(false);
    }
  }

  // Send message to backend API
  async function handleSendMessage() {
    if (!messageText.trim() && !uploadedImageUrl) {
      toast.error("Please enter a message or upload an image.");
      return;
    }

    setSending(true);

    try {
      const payload = {
        receiverUsername,
        content: messageText.trim() || (uploadedImageUrl ? "[Image]" : ""),
        imageUrl: uploadedImageUrl,
      };

      console.log(
        `📤 [MessageDrawer] Sending message to ${receiverUsername}`,
        payload
      );

      const response = await axios.post("/api/messages/send", payload);

      if (response.data.success) {
        toast.success("Message sent!");
        console.log(
          `✅ [MessageDrawer] Message sent successfully`,
          response.data
        );

        // Reset state
        setMessageText("");
        setUploadedImageUrl(null);
        onClose();
      } else {
        throw new Error(response.data.error || "Failed to send message");
      }
    } catch (err: any) {
      toast.error("Failed to send message. Please try again.");
      console.error(`❌ [MessageDrawer] Send message error:`, err.message, err);
    } finally {
      setSending(false);
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="p-6 max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle>Send Message to {receiverName}</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="space-y-4 mt-4">
          {/* Text Input */}
          <Textarea
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            className="w-full"
          />

          {/* Image Upload */}
          <div className="flex items-center gap-2">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild disabled={uploading}>
                <span>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </span>
              </Button>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Image Preview */}
          {uploadedImageUrl && (
            <div className="relative">
              <img
                src={uploadedImageUrl}
                alt="Uploaded preview"
                className="w-full h-32 object-cover rounded border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setUploadedImageUrl(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={sending || uploading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
