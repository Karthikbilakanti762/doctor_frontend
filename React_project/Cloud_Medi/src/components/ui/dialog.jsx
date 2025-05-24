"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 bg-blue-50 bg-opacity-90 transition-opacity"
      />
      <DialogPrimitive.Content
        {...props}
        className="fixed top-1/2 left-1/2 bg-white p-6 rounded-xl border border-blue-300 shadow-lg w-96 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
      >
        {children}
        <DialogPrimitive.Close className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition">
          <X className="w-5 h-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogHeader = ({ children }) => (
  <div className="mb-4 border-b border-blue-300 pb-2">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-bold text-blue-600">{children}</h2>
);

export const DialogDescription = ({ children, ...props }) => (
  <DialogPrimitive.Description
    {...props}
    className="text-sm text-gray-600 mt-1"
  >
    {children}
  </DialogPrimitive.Description>
);

export const DialogFooter = ({ children }) => (
  <div className="mt-4 flex justify-end space-x-3">{children}</div>
);
