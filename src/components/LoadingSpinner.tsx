import { motion } from 'motion/react';

export function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full"
      />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Loading data...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export function SkeletonLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 p-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex-1" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-sm animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
    </div>
  );
}
