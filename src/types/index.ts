export type Priority = "low" | "medium" | "high";

export interface Item {
  id: string;
  text: string;
  completed: boolean;
  state?: "unresolved" | "ongoing" | "completed";
  sectionId?: string;
  isPending?: boolean;
  /** Optional: if set, this item is a subtask of the item with this id. */
  parentId?: string;
  priority?: Priority;
  dueDate?: string;
  /** Optional: ISO string — item is hidden from active list until this time passes */
  snoozedUntil?: string;
  /** Optional: Array of tag IDs associated with this item */
  tags?: string[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  usageCount?: number;
  lastUsed?: string;
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
  priority: Priority;
  completed: boolean;
  isPending?: boolean;
}

export interface ListSettings {
  threeStageMode?: boolean;
  defaultSort?: "manual" | "alphabetical" | "completed" | "priority" | "dueDate";
  calendarStartTime?: string;
  calendarEndTime?: string;
  pinned?: boolean; // Kept for interface compatibility but logic disabled
}

export interface List {
  id: string;
  name: string;
  items: Item[]; // UI always expects an array
  itemOrder?: string[]; // Drives ordering of the Map-based items
  sections?: Section[];
  categoryId: string; // Kept for legacy/default support
  order?: number;
  settings?: ListSettings;
  lastAccessedAt?: string;
  archived?: boolean; // Kept for interface compatibility
  isPending?: boolean;
}

/**
 * Database-specific representation of a list.
 * items can be a Map (Record) for granular offline-friendly updates.
 */
export interface ListDB extends Omit<List, 'items'> {
    items: Item[] | Record<string, Item>;
}

export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
  body?: string;
  url?: string;
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
