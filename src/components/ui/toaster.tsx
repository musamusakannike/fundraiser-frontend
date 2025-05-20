"use client";

import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open={toast.open}
          onOpenChange={(open) => !open && dismiss(toast.id)}
          variant={toast.variant}
        >
          {toast.title && (
            <ToastTitle className="text-base font-semibold">
              {toast.title}
            </ToastTitle>
          )}
          {toast.description && (
            <ToastDescription className="text-sm text-muted-foreground">
              {toast.description}
            </ToastDescription>
          )}
          {toast.action}
          <ToastClose />
        </Toast>
      ))}
    </div>
  );
}
