# Admin Customizations

Metro: **Settings → Metro add-on** (`src/admin/routes/settings/metro-addons/page.tsx`) — add-on global (`GET/POST /admin/metro-addon-catalog`). **Settings → Metro collars** (`settings/metro-collars/page.tsx`) — tipe kerah & surcharge (`GET/POST /admin/metro-collar-catalog`). **Konten storefront (per menu, simpan per bagian):** **Informasi perusahaan** (`settings/metro-site-company/page.tsx`) — `GET/POST /admin/metro-site-company`, metadata `metro_site_company_json`. **Hero beranda** (`settings/metro-site-hero/page.tsx`) — latar di atas halaman utama (0–8 gambar; kosong = latar hitam di toko; unggah + URL, drag urutan); `GET/POST /admin/metro-site-hero`, `metro_site_hero_json`. **Galeri** (`settings/metro-site-gallery/page.tsx`) — grid, drag urutan, unggah `POST /admin/uploads`, URL; `GET/POST /admin/metro-site-gallery`, `metro_site_gallery_json`. **Klien** (`settings/metro-site-clients/page.tsx`) — `GET/POST /admin/metro-site-clients`, `metro_site_clients_json`. **Testimoni** (`settings/metro-site-testimonials/page.tsx`) — `GET/POST /admin/metro-site-testimonials`, `metro_site_testimonials_json`. **FAQ** (`settings/metro-site-faq/page.tsx`) — `GET/POST /admin/metro-site-faq`, `metro_site_faq_json`. **FAQ Sponsorship** (`settings/metro-site-sponsorship-faq/page.tsx`) — `GET/POST /admin/metro-site-sponsorship-faq`, `metro_site_sponsorship_faq_json`. Storefront tetap satu respons: `GET /store/metro-site-content` (gabungan kunci per bagian + fallback `metro_site_content_json` legacy bila ada; field `heroBackgroundUrls` dari hero; `sponsorshipFaq` untuk halaman program sponsorship).

**Order:** widget `src/admin/widgets/order-metro-details.tsx` menampilkan kerah, paket, dan rincian harga Metro di atas detail order (`order.details.before`).

**Produk:** widget `src/admin/widgets/product-metro-option-details.tsx` di akhir halaman detail produk (`product.details.after`) — form untuk poin per **nilai opsi** (mis. Essential / Elite); disimpan di `product.metadata.metro_option_details_json` dan ditampilkan di storefront pada tiap chip opsi.

You can extend the Medusa Admin to add widgets and new pages. Your customizations interact with API routes to provide merchants with custom functionalities.

> Learn more about Admin Extensions in [this documentation](https://docs.medusajs.com/learn/fundamentals/admin).

## Example: Create a Widget

A widget is a React component that can be injected into an existing page in the admin dashboard.

For example, create the file `src/admin/widgets/product-widget.tsx` with the following content:

```tsx title="src/admin/widgets/product-widget.tsx"
import { defineWidgetConfig } from "@medusajs/admin-sdk"

// The widget
const ProductWidget = () => {
  return (
    <div>
      <h2>Product Widget</h2>
    </div>
  )
}

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductWidget
```

This inserts a widget with the text “Product Widget” at the end of a product’s details page.