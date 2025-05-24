import React, { forwardRef } from "react";

const baseStyles =
  "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

const variants = {
  primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-400",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-400",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-800",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-2.5 text-lg",
};

const Button = forwardRef(
  (
    {
      children,
      onClick,
      variant = "primary",
      size = "md",
      className = "",
      type = "button",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const style = `${baseStyles} ${variants[variant]} ${sizes[size]} ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`;

    return (
      <button
        type={type}
        onClick={onClick}
        className={style}
        disabled={disabled}
        ref={ref}
        aria-label={variant === "danger" ? "Danger button" : "Button"}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
