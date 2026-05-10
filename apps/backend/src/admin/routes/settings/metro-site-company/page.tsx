import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Buildings } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useCallback, useEffect, useState } from "react";

import type { MetroSiteCompanyV1 } from "../../../../metro/metro-site-content";
import { defaultMetroSiteContent } from "../../../../metro/metro-site-content";

const MetroSiteCompanyPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<MetroSiteCompanyV1 | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/admin/metro-site-company", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { company: MetroSiteCompanyV1 };
      setCompany(data.company);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat informasi perusahaan.");
      setCompany(defaultMetroSiteContent().company);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const res = await fetch("/admin/metro-site-company", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || res.statusText);
      }
      const data = (await res.json()) as { company: MetroSiteCompanyV1 };
      setCompany(data.company);
      toast.success("Informasi perusahaan disimpan.");
    } catch (e) {
      console.error(e);
      toast.error(
        typeof e === "object" && e !== null && "message" in e
          ? String((e as Error).message)
          : "Gagal menyimpan.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!company) {
    return (
      <Container className="p-6">
        <Text>Memuat…</Text>
      </Container>
    );
  }

  const c = company;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Informasi perusahaan</Heading>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCompany(defaultMetroSiteContent().company);
              toast.info("Form dikembalikan ke template default (simpan untuk menulis ke server).");
            }}
          >
            Reset ke default
          </Button>
          <Button type="button" isLoading={saving} onClick={() => void save()}>
            Simpan
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-4xl">
        {loading ? (
          <Text size="small" className="text-ui-fg-muted">
            Memuat dari server…
          </Text>
        ) : null}
        <Text size="small" className="text-ui-fg-muted">
          Nama toko, kontak, alamat, dan tautan sosial untuk header/footer storefront.
        </Text>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nama toko</Label>
              <Input
                value={c.name}
                onChange={(e) => setCompany({ ...c, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={c.email}
                onChange={(e) => setCompany({ ...c, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Tagline</Label>
            <Input
              value={c.tagline}
              onChange={(e) => setCompany({ ...c, tagline: e.target.value })}
            />
          </div>
          <div>
            <Label>Alamat (multi baris OK)</Label>
            <Textarea
              rows={3}
              value={c.address}
              onChange={(e) => setCompany({ ...c, address: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Telepon (tampilan)</Label>
              <Input
                value={c.phoneDisplay}
                onChange={(e) => setCompany({ ...c, phoneDisplay: e.target.value })}
              />
            </div>
            <div>
              <Label>WhatsApp (angka saja, contoh 6281234567890)</Label>
              <Input
                value={c.whatsappDigits}
                onChange={(e) =>
                  setCompany({
                    ...c,
                    whatsappDigits: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Instagram (URL)</Label>
              <Input
                value={c.social.instagram}
                onChange={(e) =>
                  setCompany({
                    ...c,
                    social: { ...c.social, instagram: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label>TikTok (URL)</Label>
              <Input
                value={c.social.tiktok}
                onChange={(e) =>
                  setCompany({
                    ...c,
                    social: { ...c.social, tiktok: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label>Facebook (URL, opsional)</Label>
              <Input
                value={c.social.facebook ?? ""}
                onChange={(e) =>
                  setCompany({
                    ...c,
                    social: { ...c.social, facebook: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label>YouTube (URL, opsional)</Label>
              <Input
                value={c.social.youtube ?? ""}
                onChange={(e) =>
                  setCompany({
                    ...c,
                    social: { ...c.social, youtube: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Button type="button" isLoading={saving} onClick={() => void save()}>
          Simpan
        </Button>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Informasi perusahaan",
  icon: Buildings,
});

export default MetroSiteCompanyPage;
