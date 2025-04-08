// components/ui/badge.jsx
import React from 'react';

export const Badge = ({ children, variant, className, ...props }) => {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "danger":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      case "outline":
        return "bg-transparent border border-gray-300 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClass()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};