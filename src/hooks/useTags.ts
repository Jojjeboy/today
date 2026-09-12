import { useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFirestoreSync } from './useFirestoreSync';
import type { Tag } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateRandomColor } from '../utils/tags';

export interface UseTagsResult {
  allTags: Tag[];
  getTagById: (tagId: string) => Tag | null;
  getTagByName: (name: string) => Tag | null;
  createTag: (name: string) => Promise<Tag | null>;
  updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  incrementTagUsage: (tagId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing tags in Firestore
 * Handles CRUD operations and provides utility functions for tags
 */
export const useTags = (): UseTagsResult => {
  const { user } = useAuth();
  const tagsSync = useFirestoreSync<Tag>('users/{uid}/tags', user?.uid);

  // Get all tags
  const allTags = useMemo(() => tagsSync.data, [tagsSync.data]);

  // Get tag by ID
  const getTagById = useCallback((tagId: string): Tag | null => {
    return allTags.find(tag => tag.id === tagId) || null;
  }, [allTags]);

  // Get tag by name (case-insensitive)
  const getTagByName = useCallback((name: string): Tag | null => {
    return allTags.find(tag => tag.name.toLowerCase() === name.toLowerCase()) || null;
  }, [allTags]);

  // Create a new tag with a random color
  const createTag = useCallback(async (name: string) => {
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) return null;

    // Check if tag already exists
    const existingTag = getTagByName(normalizedName);
    if (existingTag) return existingTag;

    const newTag: Tag = {
      id: uuidv4(),
      name: normalizedName,
      color: generateRandomColor(),
      usageCount: 0,
      lastUsed: new Date().toISOString()
    };

    try {
      await tagsSync.addItem(newTag);
      return newTag;
    } catch (error) {
      console.error('Failed to create tag:', error);
      return null;
    }
  }, [user, getTagByName, tagsSync]);

  // Update a tag
  const updateTag = useCallback(async (tagId: string, updates: Partial<Tag>) => {
    if (!user) throw new Error('User not authenticated');
    await tagsSync.updateItem(tagId, updates);
  }, [user, tagsSync]);

  // Delete a tag
  const deleteTag = useCallback(async (tagId: string) => {
    if (!user) throw new Error('User not authenticated');
    await tagsSync.deleteItem(tagId);
  }, [user, tagsSync]);

  // Increment usage count for a tag
  const incrementTagUsage = useCallback(async (tagId: string) => {
    const tag = getTagById(tagId);
    if (tag) {
      await updateTag(tagId, {
        usageCount: (tag.usageCount || 0) + 1,
        lastUsed: new Date().toISOString()
      });
    }
  }, [getTagById, updateTag]);

  return {
    allTags,
    getTagById,
    getTagByName,
    createTag,
    updateTag,
    deleteTag,
    incrementTagUsage,
    loading: tagsSync.loading,
    error: tagsSync.error
  };
};