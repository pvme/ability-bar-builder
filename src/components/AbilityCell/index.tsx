import React from "react";
import { BlankAbility } from "../../data/ability-icons";
import { AbilitySlot } from "../AbilityBar";

import "./index.css";

interface AbilityCellProps {
  index: number;
  drawBarNumbers: boolean;
  slot?: AbilitySlot;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDragStart: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragEnter: (index: number) => void;
  onDragLeave: (index: number) => void;
  onDragOver: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (index: number, event: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  isDragTarget?: boolean;
}

export const AbilityCell = ({
  index,
  drawBarNumbers,
  slot,
  onClick,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  isDragging,
  isDragTarget,
}: AbilityCellProps) => {
  const hasAbility = Boolean(slot?.imgUrl);

  return (
    <div
      key={index}
      id={index.toString()}
      className={`cell-container ${hasAbility ? "has-ability" : ""} ${
        isDragging ? "is-dragging" : ""
      } ${isDragTarget ? "is-drag-target" : ""}`}
      onClick={onClick}
      draggable={hasAbility}
      onDragStart={(event) => onDragStart(index, event)}
      onDragEnd={onDragEnd}
      onDragEnter={() => onDragEnter(index)}
      onDragLeave={() => onDragLeave(index)}
      onDragOver={(event) => onDragOver(index, event)}
      onDrop={(event) => onDrop(index, event)}
    >
      <div className="ability-slot">
        {slot && (
          <div
            style={{
              background: `url(${slot.imgUrl || BlankAbility}) no-repeat`,
            }}
            className="ability-img"
          ></div>
        )}
        {drawBarNumbers && <div className="ability-txt">{index + 1}</div>}
      </div>
    </div>
  );
};
