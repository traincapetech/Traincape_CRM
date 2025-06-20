import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-lg dark:shadow-black/25 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
