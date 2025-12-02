"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomMediaUpload } from "./CustomMediaUpload"; // Adjust relative path

const postTypes = [
  { value: "UPDATE", label: "Update" },
  { value: "PHOTO", label: "Photo" },
  { value: "VIDEO", label: "Video" },
  { value: "MATCH", label: "Match" },
  { value: "OTHER", label: "Other" },
];

interface CreatePostDialogProps {
  teamId: string;
}

export default function CreatePostDialog({ teamId }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("UPDATE");
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          postType,
          mediaUrls: uploadedMediaUrls,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["team-posts", teamId] });
      setOpen(false);
      setTitle("");
      setContent("");
      setPostType("UPDATE");
      setUploadedMediaUrls([]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error creating post");
    },
  });

  const canSubmit = content.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="mb-4">
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Post Type" />
            </SelectTrigger>
            <SelectContent>
              {postTypes.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={1000}
            required
          />

          {/* New CustomMediaUpload component */}
          <CustomMediaUpload onChange={setUploadedMediaUrls} maxFiles={6} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createPostMutation.mutate()}
            disabled={!canSubmit || createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
