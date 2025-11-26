"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import the AppHeader with SSR disabled
const AppHeader = dynamic(() => import("./app-header"), {
  ssr: false,
  loading: () => <AppHeaderSkeleton />,
});

// Skeleton component shown during loading
function AppHeaderSkeleton() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-emerald-600">
              Easy Rider Athens
            </Link>
          </div>
          <div className="animate-pulse flex items-center space-x-4">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppHeaderWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton during SSR/SSG
  if (!mounted) {
    return <AppHeaderSkeleton />;
  }

  // Only render the real AppHeader on client after hydration
  return <AppHeader />;
}
