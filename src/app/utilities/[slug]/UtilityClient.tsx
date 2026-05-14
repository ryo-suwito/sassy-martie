"use client";

import React from "react";
import dynamic from "next/dynamic";

// Map slugs to their client components
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "precision-chopper": dynamic(() => import("@/app/tools/precision-chopper/ChopperClient"), { ssr: false }),
};

interface UtilityClientProps {
  slug: string;
}

export default function UtilityClient({ slug }: UtilityClientProps) {
  const Component = TOOL_COMPONENTS[slug];

  if (!Component) {
    return null;
  }

  return <Component />;
}
