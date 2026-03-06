# ☕ Coffee Bunker - Sistema POS Cafetería Fitness

Sistema de punto de venta local para cafetería de gimnasio.

## Requisitos

- **Node.js** v18+ (https://nodejs.org)
- **npm** (viene con Node.js)

## Instalación Rápida

```bash
# 1. Descomprimir el archivo
unzip coffee-bunker.zip
cd coffee-bunker

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Crear base de datos y datos iniciales
npm run setup

# 4. Instalar dependencias del frontend
cd ../frontend
npm install

# 5. Hacer build del frontend
npm run build
```

## Ejecutar

```bash
# Desde la carpeta backend
cd backend
npm run dev
```

Abre el navegador en **http://localhost:3001**

## Credenciales por defecto

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| chef | chef123 | Operador |

## Desarrollo (frontend + backend separados)

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend (con hot reload)
cd frontend && npm run dev
```

Frontend en http://localhost:5173 (proxy automático al backend)

## Estructura

```
coffee-bunker/
├── backend/
│   ├── src/
│   │   ├── index.js          # Servidor Express
│   │   ├── db.js             # SQLite (sql.js)
│   │   ├── setup-db.js       # Seed inicial
│   │   ├── middlewares/       # Auth JWT
│   │   └── routes/            # API REST
│   ├── data/                  # Base de datos (se crea automáticamente)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Router + Layout
    │   ├── pages/             # Páginas principales
    │   ├── services/api.js    # Cliente API
    │   └── context/           # Auth context
    └── package.json
```

## Módulos

- **POS** - Punto de venta con carrito, pagos mixtos, recibo imprimible
- **Inventario** - Control de insumos, alertas stock bajo, movimientos
- **Productos** - Directos y compuestos (con recetas)
- **Caja** - Apertura, cierre, cuadre
- **Reportes** - Ventas del día, top productos, pagos por método
- **Config** - Métodos de pago, categorías, usuarios

## Flujo de Productos Compuestos

Al vender un batido de proteína:
1. Se selecciona el producto en el POS
2. El sistema lee la receta (ej: 30g proteína + 200ml leche + 1 banana)
3. Descuenta automáticamente cada insumo del inventario
4. Registra movimientos de stock para trazabilidad
5. Si algún insumo queda por debajo del mínimo → alerta

## Backup

La base de datos es un solo archivo: `backend/data/coffee_bunker.db`
Copia este archivo para hacer backup.
