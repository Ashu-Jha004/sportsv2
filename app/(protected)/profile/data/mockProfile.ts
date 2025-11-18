// data/mockProfile.ts

import { ProfileData } from "../types/profile.types";

export const mockProfileData: ProfileData = {
  id: "1",
  username: "athletepro_24",
  fullName: "Alex Thompson",
  profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  bannerImage:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=400&fit=crop",
  sports: ["Basketball", "Track & Field", "Swimming"],

  city: "Los Angeles",
  state: "California",
  country: "USA",
  latitude: 34.0522,
  longitude: -118.2437,

  bio: "🏀 D1 Basketball Player | 🏃 Track Athlete | 💪 Pushing limits every day | State Champion 2024",
  rank: "Queen",
  class: "A",
  stats: {
    followers: 2847,
    following: 892,
    wins: 45,
    losses: 12,
    totalMatches: 57,
  },
  personalInfo: {
    fullName: "Alex Thompson",
    username: "athletepro_24",
    email: "alex.thompson@sparta.com",
    gender: "Male",
    dateOfBirth: "2004-03-15", // 20 years old
    joinedDate: "2023-09-01",
    lastUpdated: "2025-11-15",
  },
  sportsInfo: {
    primarySport: "Basketball",
    secondarySports: ["Track & Field", "Swimming", "Volleyball", "Tennis"],
  },
};

// data/mockProfile.ts (update the recentMatches array)

export const mockPerformanceData = {
  monthlyStats: [
    { month: "Jan", wins: 8, losses: 2, matches: 10 },
    { month: "Feb", wins: 6, losses: 3, matches: 9 },
    { month: "Mar", wins: 7, losses: 1, matches: 8 },
    { month: "Apr", wins: 9, losses: 2, matches: 11 },
    { month: "May", wins: 8, losses: 3, matches: 11 },
    { month: "Jun", wins: 7, losses: 1, matches: 8 },
  ],
  skillRadar: [
    { skill: "Speed", value: 85 },
    { skill: "Strength", value: 78 },
    { skill: "Endurance", value: 92 },
    { skill: "Agility", value: 88 },
    { skill: "Technique", value: 80 },
  ],
  recentMatches: [
    {
      id: 1,
      opponent: "Lakers Youth",
      result: "Win" as const,
      score: "78-65",
      date: "2025-11-10",
    },
    {
      id: 2,
      opponent: "Warriors Academy",
      result: "Win" as const,
      score: "82-79",
      date: "2025-11-08",
    },
    {
      id: 3,
      opponent: "Bulls Junior",
      result: "Loss" as const,
      score: "70-75",
      date: "2025-11-03",
    },
    {
      id: 4,
      opponent: "Heat Prospects",
      result: "Win" as const,
      score: "88-72",
      date: "2025-10-29",
    },
    {
      id: 5,
      opponent: "Celtics Youth",
      result: "Win" as const,
      score: "91-88",
      date: "2025-10-25",
    },
  ],
};
export const mockMediaData = {
  photos: [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600",
      caption: "Championship Game 2024",
      date: "2024-11-15",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600",
      caption: "Training Session",
      date: "2024-11-10",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1494199505258-5f95387f933c?w=600",
      caption: "Team Practice",
      date: "2024-11-05",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600",
      caption: "Victory Celebration",
      date: "2024-10-28",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600",
      caption: "Pre-game Warmup",
      date: "2024-10-20",
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
      caption: "Track Practice",
      date: "2024-10-15",
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600",
      caption: "Swimming Competition",
      date: "2024-10-10",
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600",
      caption: "Morning Run",
      date: "2024-10-05",
    },
  ],
  videos: [
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600",
      title: "Game Highlights",
      duration: "2:45",
      date: "2024-11-10",
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600",
      title: "Training Montage",
      duration: "1:30",
      date: "2024-10-25",
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600",
      title: "Skills Showcase",
      duration: "3:15",
      date: "2024-10-15",
    },
    {
      id: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600",
      title: "Championship Recap",
      duration: "4:20",
      date: "2024-09-28",
    },
  ],
};

// Friends Data - UNSPLASH PORTRAITS
export const mockFriendsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    username: "sjohnson_23",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    sport: "Track & Field",
    mutualFriends: 12,
    isFollowing: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    username: "mikechen_10",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    sport: "Swimming",
    mutualFriends: 8,
    isFollowing: true,
  },
  {
    id: 3,
    name: "Emma Davis",
    username: "emmad_basketball",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    sport: "Basketball",
    mutualFriends: 15,
    isFollowing: false,
  },
  {
    id: 4,
    name: "James Wilson",
    username: "jwilson_athlete",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    sport: "Football",
    mutualFriends: 5,
    isFollowing: true,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    username: "lisa_runs",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    sport: "Track & Field",
    mutualFriends: 20,
    isFollowing: true,
  },
  {
    id: 6,
    name: "David Martinez",
    username: "david_hoops",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    sport: "Basketball",
    mutualFriends: 7,
    isFollowing: false,
  },
  {
    id: 7,
    name: "Rachel Kim",
    username: "rachelk_athlete",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200",
    sport: "Volleyball",
    mutualFriends: 11,
    isFollowing: true,
  },
  {
    id: 8,
    name: "Chris Evans",
    username: "chris_sports",
    avatar:
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200",
    sport: "Tennis",
    mutualFriends: 9,
    isFollowing: false,
  },
];

export const mockMatchData = {
  upcoming: [
    {
      id: 1,
      opponent: "Lakers Youth",
      date: "2025-11-22",
      time: "3:00 PM",
      location: "Downtown Arena",
      type: "League",
    },
    {
      id: 2,
      opponent: "Warriors Academy",
      date: "2025-11-25",
      time: "5:30 PM",
      location: "Westside Court",
      type: "Friendly",
    },
    {
      id: 3,
      opponent: "Bulls Junior",
      date: "2025-11-28",
      time: "2:00 PM",
      location: "Central Stadium",
      type: "Tournament",
    },
  ],
  past: [
    {
      id: 1,
      opponent: "Heat Prospects",
      result: "Win" as const,
      score: "88-72",
      date: "2025-10-29",
    },
    {
      id: 2,
      opponent: "Celtics Youth",
      result: "Win" as const,
      score: "91-88",
      date: "2025-10-25",
    },
    {
      id: 3,
      opponent: "Rockets Team",
      result: "Loss" as const,
      score: "75-80",
      date: "2025-10-20",
    },
  ],
};
