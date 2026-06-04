"use client";

import React from "react";
import dynamic from "next/dynamic";

const TemplateLibraryDashboard = dynamic(
  () => import("../../components/TemplateLibraryDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div>
          <p className="text-slate-400 font-medium">Loading Template Library...</p>
        </div>
      </div>
    ),
  }
);

export default function TemplateLibraryPage() {
  const handleDeployTemplate = async (templateId: string) => {
    // This would be integrated with the actual deployment logic
    console.log(`Deploying template: ${templateId}`);
    // Implementation would go here to load template code into the editor
  };

  return <TemplateLibraryDashboard onDeployTemplate={handleDeployTemplate} />;
}
