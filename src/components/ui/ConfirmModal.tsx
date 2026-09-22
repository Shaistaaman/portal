interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Use the destructive (red) style for the confirm button. */
  destructive?: boolean;
  /** Disables the confirm button, e.g. while a required field is empty. */
  confirmDisabled?: boolean;
  /** Extra content rendered between the message and the action buttons, e.g. a reason input. */
  children?: React.ReactNode;
  /** Renders only the cancel/dismiss button, for informational-only notices with no action to confirm. */
  hideConfirm?: boolean;
}

/**
 * Generic centered confirmation dialog. First modal pattern in the admin
 * section (the header's Notification/Profile/MobileMenu popovers are
 * anchored dropdowns, not full-screen-backdrop modals) — extracted here so
 * User Management's activate/deactivate confirmation and any future
 * destructive-action confirmation share one implementation.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
  confirmDisabled = false,
  children,
  hideConfirm = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          {!hideConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-black hover:bg-neutral-800"
              }`}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
