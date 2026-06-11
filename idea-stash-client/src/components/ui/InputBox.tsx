import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
}

export const InputBox = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, type = "text", className = "", ...props }, ref) => {
    return (
      <input
        placeholder={placeholder}
        type={type}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 placeholder-gray-400 ${className}`}
        ref={ref}
        {...props}
      />
    );
  },
);

InputBox.displayName = "InputBox";
