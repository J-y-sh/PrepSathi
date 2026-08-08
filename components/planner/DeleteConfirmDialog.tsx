"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-[#1E293B] rounded-3xl p-8 shadow-2xl border border-white/5 text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Delete Task?</h3>
              <p className="text-sm text-white/40">
                This action cannot be undone. Are you sure you want to remove this task?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-bold h-12 rounded-xl"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
