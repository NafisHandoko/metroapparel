"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  completeMetroOrder,
  prepareMetroCheckout,
  previewMetroShippingOptions,
  type MetroShippingOptionChoice,
} from "@/app/actions/metro-checkout";
import { Button } from "@/components/ui/button";

const fieldClass =
  "mt-1 w-full rounded-md border border-white/15 bg-background/80 px-3 py-2 text-sm text-foreground outline-none ring-brand/40 placeholder:text-muted focus:border-brand focus:ring-2";
const labelClass = "text-xs font-semibold uppercase tracking-wider text-muted";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatShippingAmount(amount: number | null): string {
  if (amount === null || Number.isNaN(amount)) return "—";
  return idr.format(amount);
}

function addressPayload(fd: FormData) {
  return {
    email: String(fd.get("email") ?? ""),
    first_name: String(fd.get("first_name") ?? ""),
    last_name: String(fd.get("last_name") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    address_1: String(fd.get("address_1") ?? ""),
    city: String(fd.get("city") ?? ""),
    postal_code: String(fd.get("postal_code") ?? ""),
  };
}

export function MetroCheckoutForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<MetroShippingOptionChoice[] | null>(null);

  function invalidateShippingOptions() {
    setShippingOptions(null);
  }

  async function onCheckShippingOptions() {
    const form = formRef.current;
    if (!form) return;
    setError(null);
    setPending(true);
    const fd = new FormData(form);
    const res = await previewMetroShippingOptions(addressPayload(fd));
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      setShippingOptions(null);
      return;
    }
    setShippingOptions(res.options);
  }

  async function onPrepare(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!shippingOptions?.length) {
      setError('Klik dulu «Cek opsi pengiriman» setelah mengisi alamat, lalu pilih kirim atau pickup.');
      return;
    }
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const optionId = String(fd.get("shipping_option_id") ?? "");
    const res = await prepareMetroCheckout({
      ...addressPayload(fd),
      shipping_option_id: optionId || undefined,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setStep(2);
  }

  async function onComplete() {
    setError(null);
    setPending(true);
    const res = await completeMetroOrder();
    if (res.ok) {
      router.push(`/order/${res.orderId}/confirmed`);
      return;
    }
    setError(res.message);
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      {step === 1 ? (
        <form ref={formRef} onSubmit={onPrepare} className="space-y-4">
          <p className="text-sm text-muted">
            Langkah 1 — isi kontak & alamat (Indonesia), lalu cek opsi pengiriman atau pickup.
            Pembayaran manual / konfirmasi admin (provider sistem Medusa).
          </p>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={fieldClass}
              onChange={invalidateShippingOptions}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className={labelClass}>
                Nama depan
              </label>
              <input
                id="first_name"
                name="first_name"
                required
                className={fieldClass}
                onChange={invalidateShippingOptions}
              />
            </div>
            <div>
              <label htmlFor="last_name" className={labelClass}>
                Nama belakang
              </label>
              <input
                id="last_name"
                name="last_name"
                required
                className={fieldClass}
                onChange={invalidateShippingOptions}
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              WhatsApp / telepon
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={fieldClass}
              onChange={invalidateShippingOptions}
            />
          </div>
          <div>
            <label htmlFor="address_1" className={labelClass}>
              Alamat
            </label>
            <input
              id="address_1"
              name="address_1"
              required
              className={fieldClass}
              onChange={invalidateShippingOptions}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className={labelClass}>
                Kota
              </label>
              <input
                id="city"
                name="city"
                required
                className={fieldClass}
                onChange={invalidateShippingOptions}
              />
            </div>
            <div>
              <label htmlFor="postal_code" className={labelClass}>
                Kode pos
              </label>
              <input
                id="postal_code"
                name="postal_code"
                required
                className={fieldClass}
                onChange={invalidateShippingOptions}
              />
            </div>
          </div>

          {shippingOptions && shippingOptions.length > 0 ? (
            <fieldset className="space-y-3 rounded-lg border border-white/10 p-4">
              <legend className={labelClass}>Pengiriman atau ambil sendiri</legend>
              <p className="text-xs text-muted">
                Pilih satu. Ongkir di bawah mengikuti pengaturan Medusa untuk keranjang ini.
              </p>
              <div className="space-y-2">
                {shippingOptions.map((o, i) => (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-white/10 bg-background/40 px-3 py-2.5 text-sm hover:border-brand/40"
                  >
                    <input
                      type="radio"
                      name="shipping_option_id"
                      value={o.id}
                      required
                      defaultChecked={i === 0}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium text-foreground">{o.name}</span>
                      <span className="ml-2 text-muted">{formatShippingAmount(o.amount)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              className="w-full sm:w-auto"
              onClick={onCheckShippingOptions}
            >
              {pending ? "Memproses…" : "Cek opsi pengiriman"}
            </Button>
            <Button
              type="submit"
              disabled={pending || !shippingOptions?.length}
              className="w-full sm:w-auto"
            >
              {pending ? "Memproses…" : "Lanjut ke konfirmasi pesanan"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Langkah 2 — pastikan data sudah benar di keranjang, lalu buat pesanan. Order akan muncul
            di Medusa Admin; tim dapat menghubungi Anda untuk pembayaran & detail produksi.
          </p>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="button" onClick={onComplete} disabled={pending} size="lg">
            {pending ? "Memproses…" : "Buat pesanan"}
          </Button>
        </div>
      )}
    </div>
  );
}
