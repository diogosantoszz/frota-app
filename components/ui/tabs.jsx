import * as React from "react";

const Tabs = ({ defaultValue, value, onValueChange, children, ...props }) => {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  // Clone children and add selectedValue and handleValueChange as props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
    return React.cloneElement(child, {
      selectedValue,
      handleValueChange,
    });
  });

  return (
    <div {...props}>
      {enhancedChildren}
    </div>
  );
};

const TabsList = ({ className, children, selectedValue, handleValueChange, ...props }) => {
  // Clone children and add selectedValue and handleValueChange as props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    
    return React.cloneElement(child, {
      selectedValue,
      handleValueChange,
    });
  });

  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`} {...props}>
      {enhancedChildren}
    </div>
  );
};

const TabsTrigger = ({ className, value, selectedValue, handleValueChange, children, ...props }) => {
  const isSelected = selectedValue === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isSelected ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"} ${className}`}
      onClick={() => handleValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ className, value, selectedValue, children, ...props }) => {
  if (selectedValue !== value) return null;

  return (
    <div
      className={`mt-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
