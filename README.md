# FarmConnect: Phase 1 (up to Add to Cart)

React + Spring Boot + MySQL. No payments. Orders, checkout and delivery come in Phase 2.

## 1. Install
JDK 17, Maven, Node.js (LTS), MySQL 8 + Workbench, Postman.

## 2. Database
In MySQL Workbench run: `CREATE DATABASE farmer_market;`
(The app also creates it if missing.) Tables are created by JPA on first run.

## 3. Backend (folder `backend`)
1. Copy `local.properties.example` to `local.properties` and set your MySQL password and a long JWT secret.
2. Run: `mvn spring-boot:run`  (API on http://localhost:8080)
3. Check Workbench: tables `users` and `products` appear in `farmer_market`.

If Maven cannot find Spring Boot 3.5.6, change the `<version>` in `pom.xml` to the latest 3.5.x.

## 4. Frontend (folder `frontend`)
```
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
```
Then copy this project's `frontend/index.html` and everything inside `frontend/src/` over the generated files
(delete the generated `src/App.css`). Run `npm run dev` and open http://localhost:5173

## 5. API (Phase 1)
| Method | URL | Who | Success |
|---|---|---|---|
| POST | /api/auth/register/customer | public | 201 |
| POST | /api/auth/register/farmer | public | 201 |
| POST | /api/auth/login | public | 200 + token |
| GET | /api/auth/me | logged in | 200 |
| GET | /api/products?search=&category= | public | 200 |
| GET | /api/products/{id} | public | 200 |
| GET | /api/farmer/products | farmer | 200 |
| GET | /api/farmer/products/{id} | farmer (own) | 200 |
| POST | /api/farmer/products | farmer | 201 |
| PUT | /api/farmer/products/{id} | farmer (own) | 200 |
| PATCH | /api/farmer/products/{id}/availability | farmer (own) | 200 |
| DELETE | /api/farmer/products/{id} | farmer (own) | 204 |

Protected calls need the header `Authorization: Bearer <token>`.
Errors: 400 invalid data, 401 not logged in or wrong login, 403 not allowed, 404 not found, 409 email already used.

## 6. Test checklist
- [ ] Register a farmer, then log in (lands on the farmer dashboard)
- [ ] Add 3 products; edit price and stock; mark one unavailable
- [ ] Register a customer, log in, browse, search "tom", filter by category
- [ ] Unavailable and zero-stock products do not appear in the catalog
- [ ] Quantity above stock shows a message and Add to cart stays disabled
- [ ] Add to cart, change quantity, remove, refresh the page (cart stays)
- [ ] Log in as a customer and open /farmer: you land on the access-denied page
- [ ] Wrong password shows "Invalid email or password."
- [ ] Postman: a customer token on POST /api/farmer/products returns 403
- [ ] Postman: farmer A editing farmer B's product returns 403
- [ ] Workbench: `password_hash` starts with `$2a$` (never plain text)
