import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="w-full h-full min-h-[70vh] p-4 md:p-6 flex flex-col gap-6 animate-pulse select-none">
      {/* Top Header Placeholder */}
      <div className="h-10 w-48 bg-slate-800/60 rounded-xl" />

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-dark-card/40 border border-dark-border/40 rounded-2xl p-6 h-36 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-slate-800/60 rounded-md" />
              <div className="w-8 h-8 rounded-lg bg-slate-800/60" />
            </div>
            <div className="h-8 w-32 bg-slate-800/60 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-dark-card/40 border border-dark-border/40 rounded-2xl p-6 h-[320px] flex flex-col justify-between">
          <div className="h-5 w-40 bg-slate-800/60 rounded-md" />
          <div className="flex-1 flex items-end gap-2 pt-6">
            {[30, 45, 25, 60, 40, 75, 50, 65, 80, 55, 70, 90].map((h, index) => (
              <div key={index} className="flex-1 bg-slate-800/40 rounded-t-md" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-dark-card/40 border border-dark-border/40 rounded-2xl p-6 h-[320px] flex flex-col justify-between">
          <div className="h-5 w-32 bg-slate-800/60 rounded-md animate-pulse" />
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800/60" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-slate-800/60 rounded-md" />
                    <div className="h-2 w-10 bg-slate-800/60 rounded-md" />
                  </div>
                </div>
                <div className="h-3 w-12 bg-slate-800/60 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
