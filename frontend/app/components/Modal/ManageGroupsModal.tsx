"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import Input from "@/app/components/ui/Input/Input";
import { TbPlus, TbTrash, TbSettings, TbCheck, TbX, TbFolder } from "react-icons/tb";
import { useGroups } from "@/app/hooks";
import { useAuth } from "@/app/hooks";
import { PLAN_LIMITS } from "@/app/constants/limits";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

const COLOR_PALETTE = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#6b7280"];

interface ManageGroupsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageGroupsModal({ open, onClose }: ManageGroupsModalProps) {
  const t = useTranslations("ManageGroups");
  const { groups, isLoading, fetchGroups, createGroup, updateGroup, deleteGroup } = useGroups();
  const { user } = useAuth();
  const limits = user?.role === "PRO" ? PLAN_LIMITS.pro : PLAN_LIMITS.user;
  const atLimit = limits.groups !== null && groups.length >= limits.groups;

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_PALETTE[5]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    if (open) fetchGroups();
  }, [open, fetchGroups]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createGroup({ name: newName.trim(), color: newColor });
    setCreating(false);
    if (result.success) {
      setNewName("");
      setNewColor(COLOR_PALETTE[5]);
    }
  };

  const startEdit = (id: number, name: string, color: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditColor(color ?? COLOR_PALETTE[5]);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    await updateGroup(id, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  return (
    <Modal open={open} onClose={onClose} size="md" rounded="3xl" closeOnOverlayClick className="shadow-none">
      <div className="p-6 flex flex-col gap-5">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ease: "backInOut" }}
          className="text-3xl font-black italic flex items-center gap-2"
        >
          <TbFolder size={28} /> {t("title")}
        </motion.h2>

        {/* Create new group */}
        {!atLimit && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, ease: "backInOut" }}
            className="flex flex-col gap-2"
          >
            <p className="text-sm font-semibold text-dark/60">{t("newGroup")}</p>
            <div className="flex gap-2 items-center">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("namePlaceholder")}
                size="md"
                rounded="2xl"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button variant="solid" size="md" rounded="2xl" loading={creating} onClick={handleCreate} leftIcon={<TbPlus size={18} />}
                className="hover:bg-primary hover:text-dark"
              >
                {t("add")}
              </Button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: newColor === c ? "#1B1B1B88" : "transparent" }}
                  aria-label={c}
                />
              ))}
            </div>
          </motion.div>
        )}

        {atLimit && (
          <p className="text-sm text-warning bg-warning/10 rounded-xl px-3 py-2">
            {t("limitReached", { max: limits.groups })}
          </p>
        )}

        {/* Group list */}
        <div className="max-h-72 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="flex flex-col gap-2">
            {isLoading && groups.length === 0 && (
              <p className="text-sm text-dark/40">{t("loading")}</p>
            )}
            {!isLoading && groups.length === 0 && (
              <p className="text-sm text-dark/40 text-center py-4">{t("empty")}</p>
            )}
            <AnimatePresence mode="popLayout">
              {groups.map((group, i) => (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16, scaleY: 0.8 }}
                  transition={{ duration: 0.18, ease: "backOut", delay: editingId ? 0 : i * 0.03, layout: { duration: 0.2, ease: "easeInOut" } }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {editingId === group.id ? (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-dark/5"
                      >
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          size="sm"
                          rounded="xl"
                          className="flex-1"
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate(group.id)}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          {COLOR_PALETTE.map((c) => (
                            <button key={c} type="button" onClick={() => setEditColor(c)}
                              className="w-4 h-4 rounded-full border transition-transform hover:scale-110"
                              style={{ backgroundColor: c, borderColor: editColor === c ? "#1B1B1B88" : "transparent" }}
                            />
                          ))}
                        </div>
                        <Button variant="ghost" iconOnly size="sm" rounded="xl" onClick={() => handleUpdate(group.id)} leftIcon={<TbCheck size={16} />} className="text-dark hover:bg-success" />
                        <Button variant="ghost" iconOnly size="sm" rounded="xl" onClick={() => setEditingId(null)} leftIcon={<TbX size={16} />} className="text-dark hover:bg-dark/10" />
                        <Button variant="ghost" iconOnly size="sm" rounded="xl" onClick={() => { deleteGroup(group.id); setEditingId(null); }} leftIcon={<TbTrash size={16} />} className="text-dark hover:bg-danger hover:text-light" />
                      </motion.div>
                    ) : (
                      <motion.button
                        key="row"
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        onClick={() => startEdit(group.id, group.name, group.color)}
                        className="group w-full flex items-center gap-2.5 p-2 rounded-xl bg-dark/5 hover:bg-dark/8 transition-colors"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: group.color ?? "#6b7280" }}
                        />
                        <span className="font-medium text-sm flex-1 truncate text-left">{group.name}</span>
                        <span className="text-xs text-dark/30">{group._count?.links ?? 0} links</span>
                        {/* Gear — expands on hover */}
                        <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] transition-[grid-template-columns] duration-200 ease-out overflow-hidden">
                          <span className="overflow-hidden flex items-center justify-end">
                            <TbSettings size={15} className="text-dark/30 group-hover:text-dark/60 transition-colors shrink-0 mr-0.5" />
                          </span>
                        </span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Button variant="solid" size="md" rounded="2xl" onClick={onClose} className="w-full hover:bg-primary hover:text-dark">
          {t("done")}
        </Button>
      </div>
    </Modal>
  );
}
