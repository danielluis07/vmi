"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const CreateUserEventSkeleton = () => {
  return (
    <div className="space-y-5">
      {/* row 1 */}
      <div className="flex flex-col lgg:flex-row items-center justify-between gap-4">
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full h-8" />
      </div>
      {/* row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="col-span-1 sm:col-span-2 lg:col-span-1" />
        <Skeleton className="col-span-1 sm:col-span-1 lg:col-span-1" />
        <Skeleton className="col-span-1 sm:col-span-1 lg:col-span-1" />
      </div>

      {/* row 3 */}
      <Skeleton className="w-full h-44" />
      {/* row 4 */}
      <Skeleton className="w-full h-28" />
      {/* row 5 */}
      <div className="flex flex-col lgg:flex-row gap-4 w-full">
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-full h-8" />
      </div>
      {/* row 6 */}
      <div className="p-5">
        <Skeleton className="w-full h-8" />
        <div className="flex flex-col lgg:flex-row mt-5 gap-4">
          <div className="space-y-3 w-full">
            <div className="flex gap-2">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full" />
            </div>
            <Skeleton className="w-full h-8" />
          </div>
          <Skeleton className="w-full" />
        </div>
        <Skeleton className="w-full h-8 mt-5" />
      </div>
      <Skeleton className="w-full h-8" />
    </div>
  );
};
