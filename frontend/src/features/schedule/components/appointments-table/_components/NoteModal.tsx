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
      className="mt-2 rounded border bg-white p-2 shadow-md text-xs z-20 relative"
    >
      <textarea
        ref={textareaRef}
        className="w-full border rounded p-1 text-xs"
        rows={3}
        value={draft}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="mt-2 flex justify-end gap-2">
        <button
          className="px-2 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
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
