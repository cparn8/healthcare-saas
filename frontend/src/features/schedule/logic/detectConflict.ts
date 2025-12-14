// frontend/src/features/schedule/logic/detectConflict.ts

/**
 * Shape of overlap error info.
 */
export interface OverlapErrorInfo {
  isOverlap: boolean;
  backendMessage?: string;
}

/**
 * Extract whether a DRF error is an overlap error.
 * Expects DRF shape: { non_field_errors: ["...overlaps with another appointment..."] }
 */
export function detectOverlapError(error: unknown): OverlapErrorInfo {
  const anyErr = error as any;
  const data = anyErr?.response?.data;

  if (!data) {
    return { isOverlap: false };
  }

  const raw = data.non_field_errors;

  const messages: string[] = [];
  if (Array.isArray(raw)) {
    for (const m of raw) {
      if (typeof m === "string") messages.push(m);
    }
  } else if (typeof raw === "string") {
    messages.push(raw);
  }

  const match = messages.find((m) =>
    m.toLowerCase().includes("overlaps with another appointment")
  );

  if (!match) {
    return { isOverlap: false };
  }

  return {
    isOverlap: true,
    backendMessage: match,
  };
}

/**
 * Build the styled confirm message for the popup.
 */
export function buildOverlapConfirmMessage(office?: string): string {
  return (
    `Double Booking Detected\n\n` +
    `An existing appointment already occupies this time range${
      office ? ` in ${office}` : ""
    }.\n\n` +
    `Do you want to allow this overlap and continue?`
  );
}

/**
 * After catching a save/create error:
 *
 *   const allowed = await handleOverlapDuringSave(err, formData.office, requestConfirm)
 *
 * If allowed === true → caller should set allow_overlap = true and retry save.
 * If false → either:
 *   - it was NOT an overlap error, OR
 *   - user canceled the overlap confirm dialog.
 */
export async function handleOverlapDuringSave(
  error: unknown,
  office: string | undefined,
  requestConfirm?: (message: string) => Promise<boolean>
): Promise<boolean> {
  const info = detectOverlapError(error);

  if (!info.isOverlap) {
    // Not an overlap — let caller handle as a normal error
    return false;
  }

  if (!requestConfirm) {
    // Fallback for safety — should never happen in Schedule
    const ok = window.confirm(
      info.backendMessage || "Overlap detected. Continue?"
    );
    return ok;
  }

  const message = buildOverlapConfirmMessage(office);
  const proceed = await requestConfirm(message);
  return proceed;
}
