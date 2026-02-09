"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function StatusDropdown({ currentStatus, onStatusChange, options }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef(null);

    // Update position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const updateRect = () => {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: 192, // Fixed width w-48 equivalent
                    // If we wanted to align right: left: rect.right - 192
                });
            };

            updateRect();
            window.addEventListener('scroll', updateRect, { capture: true });
            window.addEventListener('resize', updateRect);

            return () => {
                window.removeEventListener('scroll', updateRect, { capture: true });
                window.removeEventListener('resize', updateRect);
            };
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If clicking inside the button, verify simple logic
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
                return;
            }
            // Since portal is outside, we allow clicks on portal content to simplify logic here
            // but actually we need to detect clicks outside the portal content too.
            // However, the portal content is not in this component's DOM tree in the same way.
            // Easiest is to add a backdrop div (invisible) that closes it.
        };
        // document.addEventListener("mousedown", handleClickOutside);
        // return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === currentStatus) || options[0];

    return (
        <>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 relative
          ${isOpen
                        ? "bg-white border-cyan-200 shadow-md ring-2 ring-cyan-100"
                        : "bg-white/50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"
                    }
        `}
            >
                <span className={`w-2 h-2 rounded-full ${getSelectedColorDot(currentStatus)}`} />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {selectedOption ? selectedOption.label : "Selecione"}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Portal for the Dropdown Menu */}
            {isOpen && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)}>
                    {/* Backdrop to catch clicks outside */}
                    <div className="absolute inset-0 bg-transparent" />

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                style={{
                                    position: 'fixed',
                                    top: dropdownPosition.top,
                                    // Calculate right alignment if needed, but here we use left from rect.
                                    // To allow right alignment we would do: left: rect.right - width
                                    left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 192 : 0,
                                    width: 192,
                                }}
                                className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-1.5 space-y-1">
                                    {options.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onStatusChange(option.value);
                                                setIsOpen(false);
                                            }}
                                            className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors
                            ${currentStatus === option.value
                                                    ? "bg-cyan-50 text-cyan-700"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }
                        `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${getOptionColorDot(option.value)}`} />
                                                {option.label}
                                            </div>
                                            {currentStatus === option.value && <Check size={14} className="text-cyan-600" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </>
    );
}

// Helper to map status values to tailwind background colors for the little dots
function getOptionColorDot(status) {
    switch (status) {
        case "novo": return "bg-yellow-400";
        case "agendado": return "bg-blue-400";
        case "concluido": return "bg-green-400";
        case "cancelado": return "bg-red-400";
        default: return "bg-slate-400";
    }
}

function getSelectedColorDot(status) {
    return getOptionColorDot(status);
}
