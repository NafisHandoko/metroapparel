"use client";

import * as React from "react";

import type { MetroSiteContentV1 } from "@/lib/medusa/site-content-types";

const SiteContentContext = React.createContext<MetroSiteContentV1 | null>(null);

export function SiteContentProvider({
  value,
  children,
}: {
  value: MetroSiteContentV1;
  children: React.ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent(): MetroSiteContentV1 {
  const ctx = React.useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }
  return ctx;
}
