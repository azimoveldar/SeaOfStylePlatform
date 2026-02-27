# Sea of Style — Vite + React + Tailwind (Serverless-Friendly)

Production-ready frontend for an AWS-friendly, serverless e-commerce site.

## ✅ Tech
- Vite + React 18
- Tailwind CSS
- Mock auth + mock serverless data (localStorage)
- Clean routing (React Router)
- Ready for AWS S3 + CloudFront (SPA)

---

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

### Mock login
- **Admin role**: sign in with an email containing `admin` (example: `admin@seaofstyle.com`).
- Regular user: any other email.

---

## Build for S3 (static hosting)

```bash
npm run build
```

This generates `dist/`.

### Upload to S3
- Upload **everything inside** `dist/` to your S3 bucket.
- If using CloudFront for a SPA, configure:
  - Default root object: `index.html`
  - Error responses: map 403/404 to `/index.html` (so routes like `/Shop` work)

---

## Environment variables
Copy `.env.example` → `.env`.

### Recommended
- `VITE_AUTH_PROVIDER=mock` (default)
- `VITE_API_BASE_URL=` your API Gateway base URL once backend exists

---

## Switching auth to AWS Cognito (optional)
This repo is **mock-auth by default** so you can test flows immediately.

If you want Cognito later:
1) Install Amplify Auth:
```bash
npm i aws-amplify
```
2) Set in `.env`:
- `VITE_AUTH_PROVIDER=cognito`
- `VITE_COGNITO_REGION`
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_USER_POOL_CLIENT_ID`

3) Replace the mock functions in `src/components/AuthContext.jsx` with Cognito calls.

---

## Project structure

```
src/
  components/
    admin/            # Admin UI components
    common/           # Navbar/Footer/ProtectedRoute
    ui/               # shadcn-style UI components
  pages/              # App pages (Home/Shop/ProductDetail/Cart/Account/Admin)
  services/
    orders.js         # localStorage mock orders (replace with API Gateway later)
  lib/                # React Query client, small helpers
```

---

## Notes (AWS architecture fit)
- **API Gateway** endpoints can replace the mock services.
- **Lambda** can create Stripe sessions & handle webhooks.
- **DynamoDB** stores products/orders/users.
- **S3 + CloudFront** hosts the built frontend + product images.

