# Metro Apparel — Docker production

Stack: **Traefik** (TLS Let’s Encrypt) + **PostgreSQL** + **Redis** + **Medusa** (API + admin di `admin.metroapparel.nafishandoko.my.id`) + **Next.js storefront** (`metroapparel.nafishandoko.my.id`). Dashboard Traefik: `traefik.nafishandoko.my.id`.

## 1. Di VPS (Sumopod)

1. **Firewall / security group** — buka **TCP 80** dan **TCP 443** (dan **22** untuk SSH). Tutup **5432/6379** ke publik jika tidak perlu akses DB dari luar.
2. Install **Docker** + **Docker Compose plugin** (v2).
3. Clone repo ke VPS, masuk folder `metroapparel`.
4. Salin env: `cp docker/production/env.example docker/production/.env` lalu edit:
   - `POSTGRES_PASSWORD`, `JWT_SECRET`, `COOKIE_SECRET` — nilai acak panjang.
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — dari Admin Medusa → Publishable API Keys.
   - Pastikan URL `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS` / `NEXT_PUBLIC_*` sama dengan domain HTTPS yang dipakai.
5. Jalankan dari root monorepo: `pnpm docker:prod:up`  
   Migrasi DB jalan otomatis di entrypoint Medusa saat container start.
6. **Let’s Encrypt** — pastikan DNS (langkah 2) sudah mengarah ke IP VPS **sebelum** pertama kali TLS di-issue; jika gagal, cek log: `pnpm docker:prod:logs`.

## 2. DNS di Hostinger (domain `nafishandoko.my.id`)

Di **DNS Zone Editor** (Hostinger), tambahkan **record A** (IPv4 VPS Sumopod) untuk:

| Tipe | Nama / Host | Nilai (points to) |
|------|-------------|-------------------|
| A | `metroapparel` | IP publik VPS |
| A | `admin.metroapparel` | IP publik VPS |
| A | `traefik` | IP publik VPS |

Hasil FQDN:

- `metroapparel.nafishandoko.my.id` → storefront  
- `admin.metroapparel.nafishandoko.my.id` → Medusa (Store API + panel admin)  
- `traefik.nafishandoko.my.id` → dashboard Traefik (tanpa auth bawaan; pertimbangkan basic auth atau IP allowlist)

**Catatan Hostinger:** field “Name” biasanya **tanpa** domain penuh — cukup `metroapparel`, `admin.metroapparel`, `traefik`. TTL default biasanya OK.

Propagasi DNS bisa 5 menit–48 jam; TLS Traefik butuh DNS sudah resolve ke VPS.

## 3. Gambar / Next.js

Storefront memuat gambar Medusa lewat URL publik. Jika domain Medusa baru, pastikan `apps/storefront/next.config.ts` memuat **`remotePatterns`** untuk hostname `admin.metroapparel.nafishandoko.my.id` (HTTPS) bila tidak memakai `unoptimized` saja.

## 4. Perintah berguna

| Perintah | Arti |
|----------|------|
| `pnpm docker:prod:up` | Build + jalankan stack production |
| `pnpm docker:prod:down` | Hentikan & hapus container (volume DB tetap) |
| `pnpm docker:prod:logs` | Stream log semua service |

## 5. Dev lokal (tanpa Traefik)

Dari root repo: `pnpm docker:up` — memakai `docker/development/docker-compose.yml` (include dari `docker-compose.yml` root).
