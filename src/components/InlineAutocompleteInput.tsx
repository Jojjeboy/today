import React, { useState, useRef, useEffect } from 'react';

interface InlineAutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    suggestions: Array<{ id: string; text: string }>;
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
    placeholder = '',
    className = '',
    autoFocus = false,
    inputPaddingClass = 'px-4',
    id,
    maxLength
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

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
        </div>
    );
};
