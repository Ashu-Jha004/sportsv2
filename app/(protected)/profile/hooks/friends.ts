// hooks/friends.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Friend {
  id: string;
  username: string;
  fullName: string;
  profileImage?: string;
  isFriend: boolean;
}

export const useFriends = () => {
  return useQuery<Friend[], Error>({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      console.log(data);
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch friends");
      }
      // Return only the friends array
      return data.friends as Friend[];
    },
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (friendId: string) => {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      if (!res.ok) {
        // Optionally parse error response for specific messages
        const errorData = await res.json().catch(() => null);
        if (errorData?.message.includes("already a friend")) {
          throw new Error("Already friends");
        }
        throw new Error("Failed to send friend request");
      }
    },
    onSuccess: (_data, friendId) => {
      // Update cache to reflect pending friend request or friendship
      queryClient.setQueryData<Friend[]>(
        ["friends"],
        (old) =>
          old?.map((f) => (f.id === friendId ? { ...f, isFriend: true } : f)) ??
          []
      );
    },
    onError: (error: Error) => {
      // Show user-friendly messages
      if (error.message.includes("Already friends")) {
        toast.success("this user is already a friend");
      } else {
        toast.error(error.message);
      }
    },
  });
};
export const useUnfriend = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (friendId) => {
      const res = await fetch("/api/friends/unfriend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      if (!res.ok) throw new Error("Failed to unfriend");
    },
    onSuccess: (_data, friendId) => {
      queryClient.setQueryData<Friend[]>(
        ["friends"],
        (old) =>
          old?.map((f) =>
            f.id === friendId ? { ...f, isFriend: false } : f
          ) ?? []
      );
    },
  });
};
