import React from "react";
import Info from "lucide-react/dist/esm/icons/info";

interface RoomModalProps {
  roomDraft: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;

  maxRoomLength: number;
}

const RoomModal: React.FC<RoomModalProps> = ({
  roomDraft,
  onChange,
  onCancel,
  onSave,
  modalRef,
  inputRef,
  maxRoomLength,
}) => {
  return (
    <div
      ref={modalRef}
      className="absolute z-30 mt-1 w-56 rounded-lg border bg-white p-3 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <Info size={14} className="text-blue-500" />
        <span className="text-xs font-semibold">Which room?</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        className="w-full border rounded px-2 py-1 text-xs"
        maxLength={maxRoomLength}
        value={roomDraft}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 2 or 309B"
      />

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={onSave}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default RoomModal;
