import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-md hover:shadow-lg rounded-2xl border border-blue-200 p-4 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`border-b border-blue-300 pb-3 mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-bold text-blue-700 ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`pt-4 mt-4 border-t border-blue-300 ${className}`}>
      {children}
    </div>
  );
}
