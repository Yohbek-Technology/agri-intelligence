# 📱 Mobile API Contract

The complete, active mobile API specification has been published to the root directory for easy access by frontend & mobile developers:

👉 **[`MOBILE_API_CONTRACT.md`](../MOBILE_API_CONTRACT.md)**

It covers:
- Base URLs & Emulator configurations (Android `10.0.2.2:5000` vs iOS `localhost:5000`)
- Global headers (`X-Client-Type`, `X-Device-Id`, `Accept-Language`, `Idempotency-Key`)
- Phone OTP & Better Auth endpoints (`/api/auth/*`)
- Smallholder self-onboarding & profile claiming
- Development Agent (DA) proxy onboarding and field verification
- PostGIS centroid GPS resolution & jurisdiction boundary checking (`/api/v1/geo/resolve`)
- Land plot profiling with customary units (*Timad*, *Kert*, *Hectare*)
- 3D Soil stratum horizons visualizer protocol (*Koticha*, *Beda*, etc.)
- Offline sync delta replication protocol (`/api/v1/sync/*`)
- Master catalogs (crops, varieties, pests, chemicals)
- Error codes matrix & mobile engineer pro-tips
