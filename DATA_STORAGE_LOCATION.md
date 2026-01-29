# 📊 Data Storage Location - Complete Guide

## 🗄️ **Main Database Files**

### 1. **Primary Database: `logistics_agent.db`**
   - **Location**: `backend/logistics_agent.db`
   - **Size**: ~225 KB (as of Jan 19, 2026)
   - **Type**: SQLite Database
   - **Contains**:
     - ✅ Orders
     - ✅ Shipments
     - ✅ Inventory
     - ✅ Products
     - ✅ Suppliers
     - ✅ Purchase Orders
     - ✅ Restock Requests
     - ✅ Returns
     - ✅ Agent Logs
     - ✅ Human Reviews
     - ✅ CRM Data (Accounts, Contacts, Leads, Opportunities)
     - ✅ Activities & Tasks
     - ✅ Notes & Communications

### 2. **Visit Tracking Database: `visit_tracking.db`**
   - **Location**: `backend/database/visit_tracking.db`
   - **Size**: ~32 KB
   - **Type**: SQLite Database
   - **Contains**:
     - ✅ Google Maps visit tracking data
     - ✅ Location-based visit records

## 📁 **Additional Data Storage**

### 3. **Product Images**
   - **Location**: `backend/static/images/products/`
   - **Contains**:
     - Product primary images
     - Product gallery images
     - Thumbnails

### 4. **Data Files Directory**
   - **Location**: `backend/data/`
   - **Contains**:
     - Excel/CSV import files
     - Data backups
     - Import/export files

### 5. **Log Files**
   - **Location**: `backend/logs/` (if exists)
   - **Contains**:
     - API logs
     - System logs
     - Error logs

## 🔧 **Database Configuration**

### Default Database Path
```python
# From backend/database/models.py
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///logistics_agent.db')
```

### Environment Variable Override
You can change the database location by setting:
```bash
DATABASE_URL=sqlite:///path/to/your/database.db
```

## 📊 **Database Schema**

The main database (`logistics_agent.db`) contains these tables:

### Logistics Tables:
- `orders` - Order records
- `shipments` - Shipment tracking
- `inventory` - Stock levels
- `products` - Product catalog
- `suppliers` - Supplier information
- `purchase_orders` - Procurement orders
- `restock_requests` - Restock alerts
- `returns` - Return processing
- `agent_logs` - AI agent activity
- `human_reviews` - Manual review records
- `couriers` - Delivery couriers
- `delivery_events` - Delivery tracking

### CRM Tables:
- `accounts` - Business accounts
- `contacts` - Contact persons
- `leads` - Lead records
- `opportunities` - Sales opportunities
- `activities` - Activity logs
- `tasks` - Task management
- `notes` - Notes and comments
- `communications` - Communication logs

## 🔍 **How to Access Data**

### 1. **Via API Endpoints**
   - All data is accessible through REST API endpoints
   - Base URL: `http://localhost:8000`
   - See `backend/API_DOCUMENTATION.md` for full API reference

### 2. **Via Database Directly**
   ```bash
   # Using SQLite command line
   sqlite3 backend/logistics_agent.db
   
   # List all tables
   .tables
   
   # Query data
   SELECT * FROM orders LIMIT 10;
   ```

### 3. **Via Python Scripts**
   ```python
   from database.service import DatabaseService
   
   with DatabaseService() as db:
       orders = db.get_orders(limit=10)
       print(orders)
   ```

## 📈 **Current Data Status**

- **Orders**: Stored in `logistics_agent.db` → `orders` table
- **Products**: Stored in `logistics_agent.db` → `products` table
- **Inventory**: Stored in `logistics_agent.db` → `inventory` table
- **Suppliers**: Stored in `logistics_agent.db` → `suppliers` table
- **CRM Data**: Stored in `logistics_agent.db` → CRM tables
- **Images**: Stored in `backend/static/images/products/`

## 🚀 **Backup Recommendations**

1. **Regular Backups**: Backup `logistics_agent.db` regularly
2. **Image Backups**: Backup `backend/static/images/` directory
3. **Configuration**: Backup environment variables and config files

## 📝 **Summary**

**All your data is stored in:**
- ✅ **Main Database**: `backend/logistics_agent.db` (SQLite)
- ✅ **Visit Tracking**: `backend/database/visit_tracking.db` (SQLite)
- ✅ **Product Images**: `backend/static/images/products/`
- ✅ **Data Files**: `backend/data/`

**Total Storage**: ~257 KB (databases) + images + data files

---

**Last Updated**: January 19, 2026
