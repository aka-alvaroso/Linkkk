import { useCallback } from "react";
import { useGroupStore } from "@/app/stores/groupStore";
import { groupService } from "@/app/services";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { CreateGroupDTO, UpdateGroupDTO } from "@/app/types";

function getErrorMessage(err: unknown): string {
  if (err instanceof HttpError || err instanceof NetworkError || err instanceof TimeoutError) return err.message;
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

export function useGroups() {
  const { groups, isLoading, error, setGroups, addGroup, updateGroupInStore, removeGroupFromStore, setLoading, setError } = useGroupStore();

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await groupService.getAll();
      setGroups(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setGroups, setLoading, setError]);

  const createGroup = useCallback(async (dto: CreateGroupDTO) => {
    setLoading(true);
    setError(null);
    try {
      const group = await groupService.create(dto);
      addGroup(group);
      return { success: true as const, data: group, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      setError(message);
      return { success: false as const, data: null, error: message, errorCode };
    } finally {
      setLoading(false);
    }
  }, [addGroup, setLoading, setError]);

  const updateGroup = useCallback(async (groupId: number, dto: UpdateGroupDTO) => {
    setLoading(true);
    setError(null);
    try {
      const group = await groupService.update(groupId, dto);
      updateGroupInStore(groupId, group);
      return { success: true as const, data: group, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      setError(message);
      return { success: false as const, data: null, error: message, errorCode };
    } finally {
      setLoading(false);
    }
  }, [updateGroupInStore, setLoading, setError]);

  const deleteGroup = useCallback(async (groupId: number) => {
    setLoading(true);
    setError(null);
    try {
      await groupService.delete(groupId);
      removeGroupFromStore(groupId);
      return { success: true as const, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      setError(message);
      return { success: false as const, error: message, errorCode };
    } finally {
      setLoading(false);
    }
  }, [removeGroupFromStore, setLoading, setError]);

  const moveLinkToGroup = useCallback(async (groupId: number, linkId: number) => {
    try {
      await groupService.moveLinkToGroup(groupId, linkId);
      return { success: true as const, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      return { success: false as const, error: message, errorCode };
    }
  }, []);

  const removeLinkFromGroup = useCallback(async (groupId: number, linkId: number) => {
    try {
      await groupService.removeLinkFromGroup(groupId, linkId);
      return { success: true as const, error: null, errorCode: null };
    } catch (err) {
      const message = getErrorMessage(err);
      const errorCode = err instanceof HttpError ? err.code : null;
      return { success: false as const, error: message, errorCode };
    }
  }, []);

  return { groups, isLoading, error, fetchGroups, createGroup, updateGroup, deleteGroup, moveLinkToGroup, removeLinkFromGroup };
}
