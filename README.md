# K6 Spike Test - Infinite Loop

Load testing application dengan k6 yang berjalan dalam loop tak terbatas.

## 📋 Requirements

- Docker & Docker Compose (untuk containerized deployment)
- Node.js 18+ (untuk local development)
- k6 (akan terinstall otomatis di Docker)

## 🏃 Quick Start - Lokal

```bash
# Install dependencies
npm install

# Run the app
node app.js
```

## 🐳 Docker - Lokal Testing

```bash
# Build image
docker build -t k6-spike-test .

# Run container
docker run -it k6-spike-test

# Atau gunakan docker-compose
docker-compose up --build
```

## 🚀 Deployment Options

### Option 1: Railway.app (⭐ Recommended - Easiest)

1. Push repo ke GitHub
2. Sign up di [railway.app](https://railway.app)
3. Connect GitHub repo
4. Set Environment: `NODE_ENV=production`
5. Deploy!

### Option 2: DigitalOcean App Platform

1. Push repo ke GitHub
2. Sign up di [DigitalOcean](https://www.digitalocean.com/app-platform/)
3. Create App → Select GitHub repo
4. Select Dockerfile
5. Deploy!

### Option 3: AWS ECS (EC2)

1. Build dan push ke Docker Hub:
```bash
docker build -t yourusername/k6-spike-test .
docker push yourusername/k6-spike-test
```

2. Di AWS:
   - Create ECS Cluster
   - Create Task Definition (point ke image Anda)
   - Create Service
   - Deploy!

### Option 4: VPS Manual (Cheapest)

1. Rent VPS (DigitalOcean, Linode, Vultr - mulai $5/bulan)
2. SSH ke server
3. Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

4. Clone repo dan run:
```bash
git clone <your-repo>
cd k6-spike-test
docker-compose up -d
```

5. Monitor logs:
```bash
docker-compose logs -f
```

## 📊 Architecture

- **app.js** - Controller loop yang menjalankan k6 berulang
- **spike_test.js** - K6 script dengan spike test configuration
- **Dockerfile** - Container image definition
- **docker-compose.yml** - Local development setup

## 🔧 Configuration

Edit `spike_test.js` untuk mengubah:
- Target URL
- VU (Virtual Users) stages
- Sleep duration

Edit `app.js` untuk mengubah:
- Delay antara iterasi (default: 5 detik)
- Error handling behavior

## 📈 Monitoring

Untuk monitoring real-time:

```bash
# Docker
docker stats k6-spike-test

# Or check logs
docker-compose logs -f k6-spike-test
```

## ⏹️ Stop Container

```bash
# Local
Ctrl+C

# Docker
docker-compose down

# Docker (dengan cleanup)
docker-compose down -v
```

## 🔐 Environment Variables

Create `.env` jika diperlukan:
```
NODE_ENV=production
LOG_LEVEL=info
```

## 📝 Notes

- App ini dirancang untuk berjalan selamanya
- Setiap iterasi kurang lebih 5 menit
- Memory usage relatif ringan
- CPU usage tergantung jumlah VUs

## 🐛 Troubleshooting

**Error: "k6 command not found"**
- Pastikan Docker built dengan benar
- Coba rebuild: `docker-compose up --build`

**Error: "Cannot connect to target URL"**
- Edit `spike_test.js` dan pastikan URL valid
- Test URL dari container: `docker exec <container-id> curl <url>`

**High memory usage**
- Reduce VUs di `spike_test.js`
- Set resource limits di `docker-compose.yml`

## 📞 Support

Untuk error atau pertanyaan, check Docker logs:
```bash
docker-compose logs --tail=100 k6-spike-test
```
