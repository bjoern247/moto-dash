# MotoDash Backend

Ein leichtes Express-API mit SQLite-Persistenz für MotoDash.

## Entwicklung

```bash
cd server
npm install
npm run dev
```

Standard-Port: `4000`. Der SQLite-Pfad kann per Umgebungsvariable `DATABASE_PATH` gesetzt werden (Standard: `./data/moto-dash.db`).

## Produktion / Docker

### Image bauen

```bash
cd server
docker build -t motodash-api .
```

### Container starten

```bash
docker run -d \
  --name motodash-api \
  -p 4000:4000 \
  -v /pfad/auf/nas/motodash-data:/app/data \
  -e PORT=4000 \
  -e CORS_ORIGIN=* \
  motodash-api
```

Die Volume-Bindung sorgt dafür, dass `moto-dash.db` auf der NAS liegt.

### Beispiel docker-compose

`docker-compose.example.yml` im Projekt liefert eine Vorlage für Portainer-Stacks.

```bash
cp docker-compose.example.yml docker-compose.yml
docker compose up -d
```

## Endpunkte

- `GET /health`: Statuscheck.
- `GET /bikes`: Liste aller Bikes.

Weitere REST-Endpunkte sollten analog ergänzt werden (CRUD für Wartung, Tanken, Teile, Touren).

