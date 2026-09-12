import React, { useState, useRef, useEffect } from 'react';
import type { Tag } from '../types';

interface InlineAutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    suggestions: Array<{ id: string; text: string }>;
    tags?: Tag[]; // Available tags for autocomplete
    onTagSelected?: (tag: Tag) => void; // Callback when a tag is selected
    placeholder?: string;
    className?: string; // Class for the input element
    autoFocus?: boolean;
    inputPaddingClass?: string; // Padding class to align shadow text (e.g., "pl-10")
    id?: string;
    maxLength?: number;
}

export const InlineAutocompleteInput: React.FC<InlineAutocompleteInputProps> = ({
    value,
    onChange,
    onSubmit,
    suggestions,
    tags = [],
    onTagSelected,
    placeholder = '',
    className = '',
    autoFocus = false,
    inputPaddingClass = 'px-4',
    id,
    maxLength
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [tagSearch, setTagSearch] = useState('');

    // Auto-resize logic
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [value]);

    // Get the top suggestion that matches current input
    const topSuggestion = suggestions.length > 0 && value.trim()
        ? suggestions.find(s => s.text.toLowerCase().startsWith(value.toLowerCase()))
        : null;

    // Calculate shadow text (the grayed-out completion)
    const shadowText = topSuggestion && value.trim()
        ? topSuggestion.text.substring(value.length)
        : '';

    // Handle Tab key or Right Arrow to complete
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && shadowText) {
            e.preventDefault();
            onChange(topSuggestion!.text);
            setShowTooltip(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    // Show tooltip on first shadow text appearance (for discoverability)
    useEffect(() => {
        if (shadowText && !showTooltip) {
            setShowTooltip(true);
            const timer = setTimeout(() => setShowTooltip(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [shadowText]);

    // Extract tag search when user types #
    useEffect(() => {
        if (value.includes('#')) {
            const lastHashIndex = value.lastIndexOf('#');
            const searchText = value.substring(lastHashIndex + 1);
            setTagSearch(searchText);
            setShowTagSuggestions(true);
        } else {
            setShowTagSuggestions(false);
            setTagSearch('');
        }
    }, [value]);

    // Filter tags based on search
    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    // Handle tag selection
    const handleTagSelect = (tag: Tag) => {
        const lastHashIndex = value.lastIndexOf('#');
        const beforeHash = value.substring(0, lastHashIndex);
        const afterHash = value.substring(lastHashIndex + 1 + tagSearch.length);

        // Replace #searchText with #tagName
        const newValue = `${beforeHash}#${tag.name} ${afterHash}`.trim();
        onChange(newValue);
        setShowTagSuggestions(false);
        onTagSelected?.(tag);
    };

    // Handle tap on shadow text (mobile)
    const handleShadowClick = () => {
        if (shadowText && topSuggestion) {
            onChange(topSuggestion.text);
            inputRef.current?.focus();
        }
    };

    // Debug logging
    // console.log('Input:', value, 'Suggestions:', suggestions.length, 'Top:', topSuggestion?.text, 'Shadow:', shadowText);

    return (
        <div className="relative">
            {/* Shadow text layer */}
            <div
                className="absolute inset-0 flex items-center pointer-events-none"
                aria-hidden="true"
                style={{ zIndex: 0 }}
            >
                {/* Debug border can be added here if needed: border border-red-500 */}
                <div className={`${inputPaddingClass} text-gray-400 dark:text-gray-500 select-none whitespace-pre-wrap break-words overflow-hidden w-full font-medium leading-normal pt-[13px]`}>
                    <span className="opacity-0">{value}</span>
                    <span>{shadowText}</span>
                </div>
            </div>

            {/* Actual input */}
            <textarea
                id={id}
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoFocus={autoFocus}
                maxLength={maxLength}
                rows={1}
                className={`relative z-10 bg-transparent resize-none overflow-hidden leading-normal ${className}`}
                style={{ backgroundColor: 'transparent' }} // Force transparency
            />

            {/* Character counter if near limit */}
            {maxLength && value.length > maxLength * 0.8 && (
                <div className="absolute right-3 -bottom-5 text-[10px] font-bold text-gray-400 animate-in fade-in duration-300">
                    {value.length}/{maxLength}
                </div>
            )}

            {/* Tap target for mobile (invisible overlay on shadow text) */}
            {shadowText && (
                <div
                    onClick={handleShadowClick}
                    className="absolute top-0 bottom-0 cursor-pointer"
                    style={{
                        left: `${value.length * 0.6}em`, // Approximate character width
                        right: 0,
                    }}
                    title="Tap to complete"
                />
            )}

            {/* Tooltip hint (shows once) */}
            {showTooltip && shadowText && (
                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-300">
                    Press <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-600 rounded">Tab</kbd> or tap to complete
                </div>
            )}

            {/* Tag suggestions dropdown */}
            {showTagSuggestions && filteredTags.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto w-48">
                    {filteredTags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tag.color || '#e5e7eb' }}
                            />
                            <span>#{tag.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
