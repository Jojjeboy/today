export interface Item {
  id: string;
  text: string;
  completed: boolean;
  state?: "unresolved" | "ongoing" | "completed";
  sectionId?: string;
  isPending?: boolean;
}

export interface Section {
  id: string;
  name: string;
  order: number;
}

export interface Todo {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  isPending?: boolean;
}

export interface ListSettings {
  threeStageMode: boolean;
  defaultSort: "manual" | "alphabetical" | "completed";
  calendarStartTime?: string;
  calendarEndTime?: string;
  pinned?: boolean; // Kept for interface compatibility but logic disabled
}

export interface List {
  id: string;
  name: string;
  items: Item[];
  sections?: Section[];
  categoryId: string; // Kept for legacy/default support
  order?: number;
  settings?: ListSettings;
  lastAccessedAt?: string;
  archived?: boolean; // Kept for interface compatibility
  isPending?: boolean;
}

export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  files?: {
    status: string;
    path: string;
  }[];
}
export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface HistoryItem {
  id: string;
  text: string;
  lastUsed: string;
  usageCount: number;
}
