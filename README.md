# Metro Apparel

E-commerce platform untuk Metro Apparel, dibangun dengan [Medusa](https://medusajs.com) (backend) dan [Next.js](https://nextjs.org) (storefront).

## Tech Stack

- **Backend**: Medusa v2 (Node.js)
- **Storefront**: Next.js 16 dengan React 19
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Package Manager**: pnpm v10 dengan Turborepo

## Project Structure

```
metroapparel/
├── apps/
│   ├── backend/          # Medusa backend + Admin panel
│   └── storefront/       # Next.js storefront
├── docker/
│   ├── development/      # Docker config untuk development
│   └── production/       # Docker config untuk production
└── package.json          # Root workspace config
```

---

## Development (Lokal)

### Prerequisites

- [Docker](https://www.docker.com/) dan Docker Compose
- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+

### Quick Start dengan Docker

1. Clone repository:

```bash
git clone <repository-url>
cd metroapparel
```

2. Jalankan semua services (PostgreSQL, Redis, Medusa):

```bash
pnpm docker:up
```

3. Buat admin user:

```bash
docker compose exec medusa sh -c "cd /server/apps/backend && pnpm medusa user -e admin@example.com -p supersecret"
```

4. Akses admin panel di `http://localhost:9000/app` dan login. Ambil **Publishable API Key** di Settings > Publishable API Keys.

5. Update `apps/storefront/.env`:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
```

6. Jalankan storefront:

```bash
docker compose up storefront -d
```

7. Akses storefront di `http://localhost:8000`

### Docker Commands

| Command | Description |
|---------|-------------|
| `pnpm docker:up` | Start semua services |
| `pnpm docker:down` | Stop semua services |
| `pnpm docker:logs` | View logs |

---

## Production Deployment

Panduan deployment ke VPS dengan Traefik sebagai reverse proxy dan SSL termination.

### Architecture

```
Internet → Traefik (HTTPS/SSL)
           ├── admin.yourdomain.com   → Medusa Backend (port 9000)
           └── store.yourdomain.com   → Next.js Storefront (port 8000)
```

### Prerequisites

- VPS dengan Docker dan Docker Compose
- Traefik sudah terinstall dan running
- Domain dengan DNS yang sudah dikonfigurasi

### Step 1: Setup Traefik (jika belum)

Buat file `docker-compose.yml` untuk Traefik:

```yaml
version: "3.9"

services:
  traefik:
    image: traefik:latest
    container_name: traefik
    command:
      - "--providers.docker=true"
      - "--providers.docker.endpoint=unix:///var/run/docker.sock"
      - "--providers.docker.exposedbydefault=false"
      - "--api.dashboard=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./acme.json:/acme.json"
    networks:
      - traefik_network

networks:
  traefik_network:
    external: true
```

Buat network dan file acme.json:

```bash
docker network create traefik_network
touch acme.json && chmod 600 acme.json
docker compose up -d
```

### Step 2: Setup DNS Records

Tambahkan A records di DNS provider:

| Type | Name | Value |
|------|------|-------|
| A | admin.metroapparel | `<IP_VPS>` |
| A | metroapparel | `<IP_VPS>` |

### Step 3: Clone Repository di VPS

```bash
cd ~
git clone <repository-url> metroapparel
cd metroapparel
```

### Step 4: Konfigurasi Environment Production

Buat file `.env.production` di root project:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<PASSWORD_KUAT>

# Medusa secrets (generate dengan: openssl rand -hex 32)
JWT_SECRET=<HASIL_GENERATE>
COOKIE_SECRET=<HASIL_GENERATE>

# Publishable Key (diisi setelah deploy Medusa)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
```

Generate secrets:

```bash
openssl rand -hex 32  # Jalankan 2x untuk JWT_SECRET dan COOKIE_SECRET
```

### Step 5: Update Domain di docker-compose.yml

Edit `docker/production/docker-compose.yml` dan ganti domain sesuai kebutuhan:

- `admin.metroapparel.nafishandoko.my.id` → domain admin kamu
- `metroapparel.nafishandoko.my.id` → domain storefront kamu

Update juga environment variables `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, dan `NEXT_PUBLIC_BASE_URL`.

### Step 6: Deploy Medusa Backend

```bash
cd ~/metroapparel

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

# Start database dan redis
docker compose -f docker/production/docker-compose.yml up -d postgres redis

# Tunggu postgres ready
sleep 10

# Build dan start Medusa
docker compose -f docker/production/docker-compose.yml up -d medusa --build

# Monitor logs
docker compose -f docker/production/docker-compose.yml logs -f medusa
```

Tunggu sampai muncul log `Server is ready on port: 9000`.

### Step 7: Buat Admin User

```bash
docker compose -f docker/production/docker-compose.yml exec medusa \
  pnpm medusa user -e admin@yourdomain.com -p <PASSWORD_ADMIN>
```

### Step 8: Ambil Publishable Key

1. Akses `https://admin.yourdomain.com/app`
2. Login dengan credentials yang dibuat
3. Pergi ke **Settings → API Key Management → Publishable API Keys**
4. Copy publishable key

### Step 9: Update .env.production

```bash
nano .env.production

# Paste publishable key ke:
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
```

### Step 10: Deploy Storefront

```bash
# Reload environment variables
export $(grep -v '^#' .env.production | xargs)

# Build dan start storefront
docker compose -f docker/production/docker-compose.yml up -d storefront --build

# Monitor logs
docker compose -f docker/production/docker-compose.yml logs -f storefront
```

Tunggu sampai muncul log `Ready in Xms`.

### Step 11: Verifikasi

```bash
# Cek semua services running
docker compose -f docker/production/docker-compose.yml ps

# Test endpoints
curl -I https://admin.yourdomain.com/health
curl -I https://store.yourdomain.com
```

---

## Production Commands

| Command | Description |
|---------|-------------|
| `docker compose -f docker/production/docker-compose.yml up -d` | Start semua services |
| `docker compose -f docker/production/docker-compose.yml down` | Stop semua services |
| `docker compose -f docker/production/docker-compose.yml logs -f` | View all logs |
| `docker compose -f docker/production/docker-compose.yml logs -f medusa` | View Medusa logs |
| `docker compose -f docker/production/docker-compose.yml logs -f storefront` | View Storefront logs |
| `docker compose -f docker/production/docker-compose.yml up -d --build medusa` | Rebuild Medusa |
| `docker compose -f docker/production/docker-compose.yml up -d --build storefront` | Rebuild Storefront |
| `docker compose -f docker/production/docker-compose.yml exec medusa sh` | Shell ke Medusa container |

---

## Troubleshooting

### 502 Bad Gateway

**Penyebab**: Traefik tidak bisa connect ke container.

**Solusi**:
1. Pastikan container running: `docker ps`
2. Cek apakah container di network yang benar:
   ```bash
   docker network inspect traefik_network
   ```
3. Pastikan label `traefik.docker.network=traefik_network` ada di docker-compose

### 504 Gateway Timeout

**Penyebab**: Traefik menggunakan IP dari network yang salah (container punya multiple networks).

**Solusi**: Tambahkan label di docker-compose:
```yaml
labels:
  - "traefik.docker.network=traefik_network"
```

### SSL Certificate tidak ter-issue

**Penyebab**: DNS belum propagate atau port 80 tidak accessible.

**Solusi**:
1. Cek DNS propagation: `dig yourdomain.com`
2. Pastikan port 80 dan 443 open di firewall
3. Cek Traefik logs: `docker logs traefik`

### Storefront tidak bisa connect ke Medusa

**Penyebab**: Environment variable salah atau network issue.

**Solusi**:
1. Pastikan `MEDUSA_BACKEND_INTERNAL_URL=http://medusa:9000` di storefront
2. Test koneksi: `docker exec metroapparel_storefront wget -qO- http://medusa:9000/health`

### Module not found di Storefront

**Penyebab**: pnpm workspace symlinks tidak bekerja di Docker.

**Solusi**: Gunakan Next.js standalone output (sudah dikonfigurasi di `next.config.ts`):
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ...
};
```

---

## Configuration Reference

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret untuk JWT tokens | Yes |
| `COOKIE_SECRET` | Secret untuk cookies | Yes |
| `STORE_CORS` | Allowed origins untuk storefront | Yes |
| `ADMIN_CORS` | Allowed origins untuk admin panel | Yes |
| `AUTH_CORS` | Allowed origins untuk authentication | Yes |

### Storefront Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Publishable API key dari Medusa | Yes |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL Medusa untuk browser | Yes |
| `MEDUSA_BACKEND_INTERNAL_URL` | URL Medusa untuk SSR (internal Docker) | Yes |
| `NEXT_PUBLIC_BASE_URL` | Base URL storefront | Yes |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region code | No |
| `PORT` | Port untuk Next.js server | No |

---

## Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
