import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Tag as TagType } from '../types';

interface TagProps {
  tag: TagType;
  onClick?: () => void;
  onRemove?: (e: React.MouseEvent) => void;
  removable?: boolean;
  interactive?: boolean;
  showColorPicker?: boolean;
  onColorChange?: (color: string) => void;
  className?: string;
}

// Predefined color palette for consistent tag colors
const PRESET_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
  '#33FFF3', '#8A2BE2', '#FF7F50', '#6495ED', '#DC143C',
  '#20B2AA', '#FFD700', '#ADFF2F', '#FF69B4', '#1E90FF'
];

export const Tag: React.FC<TagProps> = ({
  tag,
  onClick,
  onRemove,
  removable = false,
  interactive = true,
  showColorPicker = false,
  onColorChange,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);

  // Use tag color or fallback to a deterministic color based on name
  const displayColor = tag.color || PRESET_COLORS[Math.abs(hashCode(tag.name)) % PRESET_COLORS.length];

  // Simple hash function for deterministic color
  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to tag filter page
      navigate(`/tag/${tag.id}`);
    }
  };

  const handleColorChange = (color: string) => {
    onColorChange?.(color);
    setShowPicker(false);
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span
        onClick={interactive ? handleClick : undefined}
        style={{ backgroundColor: displayColor }}
        className={`
          px-2 py-0.5 rounded-md text-xs font-medium
          ${interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
          ${onClick ? 'hover:scale-105 transform' : ''}
          text-white shadow-sm select-none
        `}
        title={onClick ? t('tags.clickToFilter', 'Click to filter by this tag') : undefined}
      >
        #{tag.name}
      </span>

      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(e);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors text-xs"
          aria-label={t('tags.removeTag', 'Remove tag')}
        >
          ×
        </button>
      )}

      {showColorPicker && onColorChange && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPicker(!showPicker);
            }}
            className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ backgroundColor: displayColor }}
            aria-label={t('tags.changeColor', 'Change tag color')}
          />
          {showPicker && (
            <div className="absolute z-50 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <ColorPicker
                value={displayColor}
                onChange={handleColorChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Simple color picker component
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {PRESET_COLORS.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-5 h-5 rounded-full border-2 transition-all ${
            value === color ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-transparent hover:border-gray-400'
          }`}
          style={{ backgroundColor: color }}
          aria-label={`Choose color ${color}`}
          title={color}
        />
      ))}
    </div>
  );
};