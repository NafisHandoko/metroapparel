import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteContentProvider } from "@/components/site-content-provider";
import { getResolvedSiteContent } from "@/lib/medusa/site-content";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteContent = await getResolvedSiteContent();
  return (
    <SiteContentProvider value={siteContent}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </SiteContentProvider>
  );
}
