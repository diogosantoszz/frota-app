import * as React from "react";

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "slot" : "button";
    
    const getVariantClass = () => {
      switch (variant) {
        case "destructive":
          return "bg-red-500 text-white hover:bg-red-600";
        case "outline":
          return "border border-gray-300 bg-transparent hover:bg-gray-100";
        case "secondary":
          return "bg-gray-100 text-gray-900 hover:bg-gray-200";
        case "ghost":
          return "bg-transparent hover:bg-gray-100";
        case "link":
          return "bg-transparent underline-offset-4 hover:underline";
        default: // "primary"
          return "bg-blue-500 text-white hover:bg-blue-600";
      }
    };
    
    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "h-8 rounded-md px-3 text-xs";
        case "lg":
          return "h-11 rounded-md px-8";
        case "icon":
          return "h-9 w-9";
        default: // "default"
          return "h-10 px-4 py-2 rounded-md";
      }
    };

    return (
      <Comp
        className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${getVariantClass()} ${getSizeClass()} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
