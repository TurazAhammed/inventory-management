# Inventory Backend

Express backend for inventory management.

Quick start:

```bash
cd backend
npm install
npm run dev    # starts server with nodemon
# or
npm start      # runs node server.js
```

Environment:
- Copy `.env.example` to `.env` and set database credentials.

API endpoints:
- `GET /api/inventory` - list items (includes `is_active`)
- `POST /api/inventory` - add item
- `DELETE /api/inventory/:id` - soft-delete item (sets `is_active = 0`)
- `GET /api/items` - legacy items route
- `POST /api/sales` - create sale
