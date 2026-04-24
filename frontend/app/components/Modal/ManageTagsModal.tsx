"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import Input from "@/app/components/ui/Input/Input";
import { TbPlus, TbTrash, TbSettings, TbCheck, TbX, TbTag } from "react-icons/tb";
import { useTags } from "@/app/hooks";
import { useAuth } from "@/app/hooks";
import { PLAN_LIMITS } from "@/app/constants/limits";
import TagChip, { isDark } from "@/app/components/Tags/TagChip";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

const HEX_PALETTE = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#6b7280"];


interface ManageTagsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageTagsModal({ open, onClose }: ManageTagsModalProps) {
  const t = useTranslations("ManageTags");
  const { tags, isLoading, fetchTags, createTag, updateTag, deleteTag } = useTags();
  const { user } = useAuth();
  const limits = user?.role === "PRO" ? PLAN_LIMITS.pro : PLAN_LIMITS.user;
  const atLimit = limits.tags !== null && tags.length >= limits.tags;

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(HEX_PALETTE[5]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    if (open) fetchTags();
  }, [open, fetchTags]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createTag({ name: newName.trim(), color: newColor });
    setCreating(false);
    if (result.success) {
      setNewName("");
      setNewColor(HEX_PALETTE[5]);
    }
  };

  const startEdit = (id: number, name: string, color: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditColor(color ?? HEX_PALETTE[5]);
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    await updateTag(id, { name: editName.trim(), color: editColor });
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
          <TbTag size={28} /> {t("title")}
        </motion.h2>

        {/* Create new tag */}
        {!atLimit && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, ease: "backInOut" }}
            className="flex flex-col gap-2"
          >
            <p className="text-sm font-semibold text-dark/60">{t("newTag")}</p>
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
            {/* Color palette */}
            <div className="flex gap-1.5 flex-wrap">
              {HEX_PALETTE.map((c) => (
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
            {newName && (
              <div className="flex items-center gap-2 text-sm text-dark/50">
                <span>{t("preview")}:</span>
                <TagChip tag={{ id: 0, userId: 0, name: newName, color: newColor, createdAt: "" }} size="sm" variant="solid" />
              </div>
            )}
          </motion.div>
        )}

        {atLimit && (
          <p className="text-sm text-warning bg-warning/10 rounded-xl px-3 py-2">
            {t("limitReached", { max: limits.tags })}
          </p>
        )}

        {/* Tag list */}
        <div className="max-h-72 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className={`flex flex-wrap gap-2 ${editingId === null ? 'py-2 px-1' : ''}`}>
          {isLoading && tags.length === 0 && <p className="text-sm text-dark/40">{t("loading")}</p>}
          {!isLoading && tags.length === 0 && (
            <p className="text-sm text-dark/40 text-center py-4 w-full">{t("empty")}</p>
          )}
          <AnimatePresence mode="popLayout">
            {tags.map((tag, i) => (
              <motion.div
                key={tag.id}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18, ease: "backOut", delay: editingId ? 0 : i * 0.03, layout: { duration: 0.2, ease: "easeInOut" } }}
                className={editingId === tag.id ? "w-full" : ""}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {editingId === tag.id ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      style={{ transformOrigin: "top" }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-dark/5"
                    >
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        size="sm"
                        rounded="xl"
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(tag.id)}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {HEX_PALETTE.map((c) => (
                          <button key={c} type="button" onClick={() => setEditColor(c)}
                            className="w-4 h-4 rounded-full border transition-transform hover:scale-110"
                            style={{ backgroundColor: c, borderColor: editColor === c ? "#1B1B1B88" : "transparent" }}
                          />
                        ))}
                      </div>
                      <Button variant="ghost" iconOnly size="sm" rounded="xl" onClick={() => handleUpdate(tag.id)} leftIcon={<TbCheck size={16} />} className="text-dark hover:bg-success" />
                      <Button variant="ghost" iconOnly size="sm" rounded="xl" onClick={() => setEditingId(null)} leftIcon={<TbX size={16} />} className="text-dark hover:bg-dark/10" />
                      <Button variant="ghost" iconOnly size="sm" rounded="xl" onClick={() => { deleteTag(tag.id); setEditingId(null); }} leftIcon={<TbTrash size={16} />} className="text-dark hover:bg-danger hover:text-light" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chip"
                      role="button"
                      tabIndex={0}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.12, ease: "backOut" }}
                      onClick={() => startEdit(tag.id, tag.name, tag.color)}
                      onKeyDown={(e) => e.key === 'Enter' && startEdit(tag.id, tag.name, tag.color)}
                      className="group flex items-center rounded-full overflow-hidden cursor-pointer"
                      style={{ backgroundColor: tag.color ?? "#6b7280" }}
                    >
                      <TagChip tag={tag} size="md" variant="solid" className="border-0 bg-transparent pointer-events-none" />
                      <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] transition-[grid-template-columns] duration-200 ease-out">
                        <span className="overflow-hidden flex items-center">
                          <TbSettings
                            size={16}
                            className="mr-2.5 shrink-0 cursor-pointer"
                            style={{ color: isDark(tag.color ?? "#6b7280") ? "#ffffffcc" : "#1b1b1bcc" }}
                          />
                        </span>
                      </span>
                    </motion.div>
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
