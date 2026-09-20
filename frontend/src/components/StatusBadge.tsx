import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'referral' | 'priority' | 'followup' | 'stock' | 'health';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'referral', size = 'md' }) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let bgClass = "bg-slate-100 text-slate-700 border-slate-200";
  let dotClass = "bg-slate-400";
  let label = status;

  if (type === 'priority') {
    switch (normalized) {
      case 'EMERGENCY':
        bgClass = "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse";
        dotClass = "bg-red-600";
        break;
      case 'URGENT':
        bgClass = "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
        dotClass = "bg-amber-600";
        break;
      case 'ROUTINE':
      default:
        bgClass = "bg-blue-50 text-blue-700 border-blue-200";
        dotClass = "bg-blue-500";
        break;
    }
  } else if (type === 'referral') {
    switch (normalized) {
      case 'REFERRED':
        bgClass = "bg-indigo-50 text-indigo-700 border-indigo-200";
        dotClass = "bg-indigo-500";
        label = "1. Referred";
        break;
      case 'ACCEPTED':
        bgClass = "bg-sky-50 text-sky-700 border-sky-200";
        dotClass = "bg-sky-500";
        label = "2. Accepted";
        break;
      case 'PATIENT_RECEIVED':
        bgClass = "bg-amber-50 text-amber-700 border-amber-200";
        dotClass = "bg-amber-500";
        label = "3. Patient Received";
        break;
      case 'TREATMENT_COMPLETED':
        bgClass = "bg-purple-50 text-purple-700 border-purple-200";
        dotClass = "bg-purple-500";
        label = "4. Treatment Completed";
        break;
      case 'FOLLOW_UP_REQUIRED':
        bgClass = "bg-orange-50 text-orange-700 border-orange-300 font-semibold";
        dotClass = "bg-orange-500";
        label = "5. Follow-Up Required";
        break;
      case 'FOLLOW_UP_COMPLETED':
        bgClass = "bg-teal-50 text-teal-700 border-teal-200";
        dotClass = "bg-teal-500";
        label = "6. Follow-Up Done";
        break;
      case 'CLOSED':
        bgClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
        dotClass = "bg-emerald-600";
        label = "7. Cycle Closed & Complete";
        break;
    }
  } else if (type === 'followup') {
    switch (normalized) {
      case 'DUE':
        bgClass = "bg-amber-100 text-amber-800 border-amber-300 font-bold";
        dotClass = "bg-amber-600";
        label = "Due Today";
        break;
      case 'OVERDUE':
        bgClass = "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse";
        dotClass = "bg-red-600";
        label = "Overdue Alert";
        break;
      case 'COMPLETED':
        bgClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
        dotClass = "bg-emerald-600";
        label = "Completed";
        break;
      case 'UPCOMING':
      default:
        bgClass = "bg-slate-100 text-slate-700 border-slate-200";
        dotClass = "bg-slate-500";
        label = "Upcoming";
        break;
    }
  } else if (type === 'stock') {
    switch (normalized) {
      case 'AVAILABLE':
        bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        dotClass = "bg-emerald-500";
        label = "Available";
        break;
      case 'LOW_STOCK':
        bgClass = "bg-amber-50 text-amber-700 border-amber-300";
        dotClass = "bg-amber-500";
        label = "Low Stock";
        break;
      case 'OUT_OF_STOCK':
      case 'UNAVAILABLE':
        bgClass = "bg-red-50 text-red-700 border-red-300 font-semibold";
        dotClass = "bg-red-500";
        label = "Out of Stock / Unavailable";
        break;
      case 'REFERRAL_REQUIRED':
        bgClass = "bg-purple-50 text-purple-700 border-purple-200";
        dotClass = "bg-purple-500";
        label = "Referral Required";
        break;
    }
  } else if (type === 'health') {
    switch (normalized) {
      case 'GOOD':
        bgClass = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
        dotClass = "bg-emerald-600";
        break;
      case 'WARNING':
        bgClass = "bg-amber-100 text-amber-800 border-amber-300 font-bold";
        dotClass = "bg-amber-600";
        break;
      case 'CRITICAL':
        bgClass = "bg-red-100 text-red-800 border-red-300 font-bold";
        dotClass = "bg-red-600";
        break;
    }
  }

  const sizeClasses = size === 'sm' ? "text-xs px-2 py-0.5" : size === 'lg' ? "text-sm px-3.5 py-1.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      {label}
    </span>
  );
};
