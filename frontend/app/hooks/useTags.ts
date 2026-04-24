import { useCallback } from "react";
import { useTagStore } from "@/app/stores/tagStore";
import { tagService } from "@/app/services";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { CreateTagDTO, UpdateTagDTO } from "@/app/types";

function getErrorMessage(err: unknown): string {
  if (err instanceof HttpError || err instanceof NetworkError || err instanceof TimeoutError) return err.message;
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

export function useTags() {
  const { tags, isLoading, error, setTags, addTag, updateTagInStore, removeTagFromStore, setLoading, setError } = useTagStore();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tagService.getAll();
      setTags(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setTags, setLoading, setError]);

  const createTag = useCallback(async (dto: CreateTagDTO) => {
    setLoading(true);
    setError(null);
    try {
      const tag = await tagService.create(dto);
      addTag(tag);
      return { success: true as const, data: tag, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      setError(message);
      return { success: false as const, data: null, error: message, errorCode };
    } finally {
      setLoading(false);
    }
  }, [addTag, setLoading, setError]);

  const updateTag = useCallback(async (tagId: number, dto: UpdateTagDTO) => {
    setLoading(true);
    setError(null);
    try {
      const tag = await tagService.update(tagId, dto);
      updateTagInStore(tagId, tag);
      return { success: true as const, data: tag, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      setError(message);
      return { success: false as const, data: null, error: message, errorCode };
    } finally {
      setLoading(false);
    }
  }, [updateTagInStore, setLoading, setError]);

  const deleteTag = useCallback(async (tagId: number) => {
    setLoading(true);
    setError(null);
    try {
      await tagService.delete(tagId);
      removeTagFromStore(tagId);
      return { success: true as const, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      setError(message);
      return { success: false as const, error: message, errorCode };
    } finally {
      setLoading(false);
    }
  }, [removeTagFromStore, setLoading, setError]);

  const assignTagsToLink = useCallback(async (linkId: number, tagIds: number[]) => {
    try {
      await tagService.assignToLink(linkId, tagIds);
      return { success: true as const, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      return { success: false as const, error: message, errorCode };
    }
  }, []);

  return { tags, isLoading, error, fetchTags, createTag, updateTag, deleteTag, assignTagsToLink };
}
