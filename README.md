# RoleBase frontend

React + TypeScript, Ant Design, TanStack Query va Zustand asosidagi RBAC boshqaruv paneli.

```bash
cp .env.example .env
pnpm install --ignore-workspace
pnpm dev
```

`VITE_API_URL` standart qiymati `https://task-backend-pa1x.onrender.com`. Lokal backend bilan ishlash uchun `.env` ichida `http://localhost:3000` qiymatini qo‘ying.

Asosiy imkoniyatlar:

- login va token yangilash;
- ADMIN uchun foydalanuvchi yaratish, tahrirlash, o‘chirish va rol biriktirish;
- PAYMENT uchun to‘lovlar, qidiruv va filtrlar;
- REPORTS uchun tranzaksiya hisoboti;
- ruxsat bo‘lmagan sahifalar uchun 403.

Rollar brauzer keshida saqlanmaydi: sahifa yangilanganda profil `/auth/me` dan olinadi va joriy ruxsatlar qo‘llanadi.

Production build:

```bash
pnpm build
```
