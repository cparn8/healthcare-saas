import React from "react";

interface NoteModalProps {
  draft: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const NoteModal: React.FC<NoteModalProps> = ({
  draft,
  onChange,
  onCancel,
  onSave,
  modalRef,
  textareaRef,
}) => {
  return (
    <div
      ref={modalRef}
      className="mt-2 rounded border border-grid-border dark:border-dButton-mborder bg-input dark:bg-input-dlight p-2 shadow-md text-xs z-20 relative"
    >
      <textarea
        ref={textareaRef}
        className="w-full border border-input-border dark:border-dButton-border bg-input-lighter dark:bg-dButton rounded p-1 text-xs"
        rows={3}
        value={draft}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="mt-2 flex justify-end gap-2">
        <button
          className="px-2 py-1 rounded bg-bg dark:bg-dButton-border border border-mBorder dark:border-toggle-dark text-text-primary dark:text-text-darkPrimary hover:bg-side hover:dark:bg-dButton-mhover transition"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="px-2 py-1 rounded bg-primary text-input-lighter hover:bg-primary-hover transition"
          type="button"
          onClick={onSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NoteModal;
