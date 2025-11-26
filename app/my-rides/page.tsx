"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the client component with SSR disabled
const MyRidesPageClient = dynamic(() => import("./page-client"), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-gray-600">Loading your rides...</span>
        </div>
      </div>
    </div>
  ),
});

export default function MyRidesPage() {
  return <MyRidesPageClient />;
}
