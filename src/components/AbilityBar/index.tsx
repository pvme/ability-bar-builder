import { useState } from "react";
import Popover from "@mui/material/Popover";
import { RemoveCircleOutline } from "@mui/icons-material";
import {
  MeleeAbilities,
  RangeAbilities,
  MageAbilities,
  NecromancyAbilities,
  NecromancyIncantations,
  DefensiveAbilities,
  ConstitutionAbilities
} from "../../data/ability-icons";
import { useStickyState } from "../../hooks/useStickyState";
import { AbilityCell } from "../AbilityCell";

import "./index.css";
import { BackgroundImage } from "../../data/background-images";

interface AbilityBarContainerProps {
  revo?: boolean;
  barNumbers: boolean;
  slotCount: number;
  revoSlotCount: number;
}

interface SelectableAbilityIconProps {
  index: number;
  imgUrl: string;
  onClick: (event: React.MouseEvent<HTMLImageElement>) => void;
  onDragStart: (imgUrl: string, event: React.DragEvent<HTMLImageElement>) => void;
  onDragEnd: () => void;
}

interface AbilityStyle {
  icon: string;
  abilities: string[];
}

export interface AbilitySlot {
  imgUrl?: string;
}

type DraggedAbility =
  | {
      source: "palette";
      imgUrl: string;
    }
  | {
      source: "bar";
      index: number;
      imgUrl: string;
    };

const abilityStyles: AbilityStyle[] = [
  {
    icon: "https://runescape.wiki/images/Attack.png",
    abilities: MeleeAbilities,
  },
  {
    icon: "https://runescape.wiki/images/Ranged.png",
    abilities: RangeAbilities,
  },
  {
    icon: "https://runescape.wiki/images/Magic.png",
    abilities: MageAbilities,
  },
  {
    icon: "https://runescape.wiki/images/Necromancy.png",
    abilities: NecromancyAbilities,
  },
  {
    icon: "https://runescape.wiki/images/Incantations_icon.png",
    abilities: NecromancyIncantations,
  },
  {
    icon: "https://runescape.wiki/images/Defence.png",
    abilities: DefensiveAbilities,
  },
  {
    icon: "https://runescape.wiki/images/Constitution.png",
    abilities: ConstitutionAbilities,
  }
];

const SelectableAbilityIcon = ({
  index,
  imgUrl,
  onClick,
  onDragStart,
  onDragEnd,
}: SelectableAbilityIconProps) => (
  <img
    key={index}
    src={imgUrl}
    alt=""
    className="selectable-ability-icon"
    draggable
    onClick={onClick}
    onDragStart={(event) => onDragStart(imgUrl, event)}
    onDragEnd={onDragEnd}
  />
);

export const AbilityBarContainer = ({
  revo,
  barNumbers,
  slotCount,
  revoSlotCount,
}: AbilityBarContainerProps) => {
  const [slots, setSlots] = useStickyState<AbilitySlot[]>(
    Array.from({ length: slotCount }, () => ({})),
    "slots"
  );
  const [activeSelection, setActiveSelection] =
    useState<string[]>(MeleeAbilities);
  const [draggedAbility, setDraggedAbility] = useState<DraggedAbility | null>(
    null
  );
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = () => Boolean(anchorEl);
  const id = open() ? "simple-popover" : undefined;

  const swapAbility = (imgUrl?: string) => {
    if (!anchorEl) {
      return;
    }
    let temp = [...slots];
    const index = parseInt(anchorEl.id);
    let item = { ...temp[index] };
    item.imgUrl = imgUrl;
    temp[index] = item;
    setSlots(temp);
    handleClose();
  };

  const handlePaletteDragStart = (
    imgUrl: string,
    event: React.DragEvent<HTMLImageElement>
  ) => {
    setDraggedAbility({ source: "palette", imgUrl });
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", imgUrl);
  };

  const handleBarDragStart = (
    index: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    const imgUrl = slots[index]?.imgUrl;

    if (!imgUrl) {
      event.preventDefault();
      return;
    }

    setDraggedAbility({ source: "bar", index, imgUrl });
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", imgUrl);
  };

  const handleDragEnd = () => {
    setDraggedAbility(null);
    setDropTargetIndex(null);
  };

  const handleDragEnter = (index: number) => {
    if (draggedAbility) {
      setDropTargetIndex(index);
    }
  };

  const handleDragLeave = (index: number) => {
    setDropTargetIndex((currentIndex) =>
      currentIndex === index ? null : currentIndex
    );
  };

  const handleDragOver = (
    index: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!draggedAbility) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect =
      draggedAbility.source === "palette" ? "copy" : "move";
    setDropTargetIndex(index);
  };

  const handleDrop = (
    dropIndex: number,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    if (!draggedAbility) {
      return;
    }

    setSlots((currentSlots) => {
      const nextSlots = [...currentSlots];

      while (nextSlots.length < slotCount) {
        nextSlots.push({});
      }

      if (draggedAbility.source === "palette") {
        nextSlots[dropIndex] = { imgUrl: draggedAbility.imgUrl };
        return nextSlots;
      }

      const dragIndex = draggedAbility.index;

      if (dragIndex === dropIndex) {
        return nextSlots;
      }

      const draggedSlot = { ...nextSlots[dragIndex] };
      nextSlots[dragIndex] = { ...nextSlots[dropIndex] };
      nextSlots[dropIndex] = draggedSlot;
      return nextSlots;
    });

    handleDragEnd();
  };

  const revoBorderWidth = (67 * revoSlotCount - 5)
  const visibleSlots = Array.from(
    { length: slotCount },
    (_, index) => slots[index] ?? {}
  );

  return (
    <div className={`ability-bar-container ${revo ? "revo" : "manual"} ${draggedAbility ? "is-dragging-ability" : ""}`} >
      
      <div className={`revo-border`} style={{ width: revoBorderWidth.toString() + "px" }} />

      {visibleSlots.map((slot, index) => (
        <AbilityCell
          key={index}
          index={index}
          drawBarNumbers={barNumbers}
          slot={slot}
          onClick={handleClick}
          onDragStart={handleBarDragStart}
          onDragEnd={handleDragEnd}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragging={
            draggedAbility?.source === "bar" && draggedAbility.index === index
          }
          isDragTarget={dropTargetIndex === index}
        />
      ))}


      <Popover
        id={id}
        open={open()}
        anchorEl={anchorEl}
        onClose={handleClose}
        style={{ borderRadius: 0, pointerEvents: "none" }}
        PaperProps={{
          style: { pointerEvents: "auto" },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            width: "448px",
            backgroundImage: `url(${BackgroundImage})`,
          }}
        >
          <div id="header">
            {abilityStyles.map((style, index) => (
              <img
                key={index}
                src={style.icon}
                style={{
                  width: 35,
                  height: 35,
                  padding: "10px 10px 0 10px",
                  cursor: "pointer",
                }}
                alt=""
                onClick={() => setActiveSelection(style.abilities)}
              />
            ))}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => swapAbility()}
            >
              <RemoveCircleOutline
                color="error"
                style={{
                  width: 40,
                  height: 40,
                  margin: "10px 10px 0 10px",
                }}
              />
            </div>
          </div>
          <hr style={{ width: 300 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {activeSelection.map((ability, index) => (
              <SelectableAbilityIcon
                key={index}
                index={index}
                imgUrl={ability}
                onClick={() => swapAbility(ability)}
                onDragStart={handlePaletteDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>
      </Popover>
    </div>
  );
};
