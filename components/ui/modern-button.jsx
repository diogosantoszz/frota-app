// components/ui/modern-button.jsx
import React from 'react';

export const Button = React.forwardRef(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "destructive":
          return "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
        case "outline":
          return "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500";
        case "secondary":
          return "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500";
        case "ghost":
          return "bg-transparent hover:bg-gray-100 focus:ring-gray-500";
        case "link":
          return "bg-transparent underline-offset-4 hover:underline text-blue-600 hover:text-blue-800 focus:ring-blue-500";
        default: // "primary"
          return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
      }
    };
    
    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "h-8 text-xs px-3 py-1 rounded";
        case "lg":
          return "h-12 text-base px-8 py-3 rounded-md";
        case "icon":
          return "h-10 w-10 p-2 rounded-full";
        default: // "default"
          return "h-10 text-sm px-4 py-2 rounded-md";
      }
    };

    return (
      <button
        className={`inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${getVariantClass()} ${getSizeClass()} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";