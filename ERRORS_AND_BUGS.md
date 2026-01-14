# Errors and Bugs Report

**Project:** AI Agent Logistics System  
**Date:** November 4, 2025  
**Repository:** ai-crm  

---

## 🐛 Known Issues

### 1. **Backend API Endpoints Missing**

#### Issue
The Supplier Management frontend references API endpoints that may not be implemented in the backend.

**Affected Endpoints:**
- `POST /suppliers/notify-restock` - Send restock alert to suppliers
- `POST /suppliers/send-po` - Send purchase order confirmation

**Location:** `frontend/src/pages/Suppliers.jsx`

**Error Details:**
```javascript
// These endpoints are called but may return 404
fetch(`${API_BASE_URL}/suppliers/notify-restock`, {...})
fetch(`${API_BASE_URL}/suppliers/send-po`, {...})
```

**Impact:** Medium  
**Status:** ⚠️ Needs Implementation

**Recommended Fix:**
Implement the missing endpoints in `backend/api_app.py`:
```python
@app.post("/suppliers/notify-restock")
def notify_supplier_restock(data: dict):
    # Use supplier_notification_system.py
    from supplier_notification_system import notify_supplier_for_restock
    return notify_supplier_for_restock(...)

@app.post("/suppliers/send-po")
def send_purchase_order(data: dict):
    # Use supplier_notification_system.py
    from supplier_notification_system import supplier_notifier
    return supplier_notifier.send_order_confirmation_to_supplier(...)
```

---

### 2. **Missing UI Component - Badge**

#### Issue
The Suppliers page imports `Badge` component that may not exist.

**Location:** `frontend/src/pages/Suppliers.jsx` line 13

**Error Details:**
```javascript
import { Badge } from '@/components/common/ui/Badge';
// This component may not exist in the ui folder
```

**Impact:** High (Breaks the page)  
**Status:** 🔴 Critical

**Recommended Fix:**
Create `frontend/src/components/common/ui/Badge.jsx`:
```javascript
import React from 'react';
import { cn } from '@/utils/helpers';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-info/10 text-info border-info/20',
    outline: 'bg-transparent border-border text-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
```

---

### 3. **Sidebar Navigation - Removed Items**

#### Issue
Supplier Management and Analytics sections were removed from sidebar but the routes still exist.

**Location:** `frontend/src/components/layout/Sidebar.jsx`

**Error Details:**
- Removed: "Supplier Management" menu item
- Removed: "Analytics & Reports" section
- Routes `/suppliers` and `/analytics` still accessible via direct URL

**Impact:** Low  
**Status:** ⚠️ Inconsistent UI

**Recommended Fix:**
Either:
1. Re-add the menu items
2. Remove the corresponding route handlers
3. Add redirects from removed routes

---

### 4. **CSS Linter Warnings**

#### Issue
Tailwind CSS `@apply` directives show as "Unknown at rule" in CSS linter.

**Location:** `frontend/src/index.css`

**Error Details:**
```
Lines 82, 87, 92, 97, 102, 104, 106, 110, 113, 115, 117
"Unknown at rule @apply"
```

**Impact:** None (cosmetic only)  
**Status:** ℹ️ Informational

**Recommended Fix:**
Configure CSS linter to recognize Tailwind:
- Install `stylelint-config-standard`
- Add PostCSS support in VSCode settings

---

### 5. **Dark Mode Default Behavior**

#### Issue
Dark mode preference logic was reverted - may not default to dark mode consistently.

**Location:** `frontend/src/components/layout/Layout.jsx`

**Current Behavior:**
```javascript
const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
```

**Impact:** Low  
**Status:** ⚠️ UX Issue

**Recommended Fix:**
Update to default to dark mode:
```javascript
const shouldBeDark = stored === 'dark' || stored === null || (!stored && prefersDark);
```

---

### 6. **Authentication Not Implemented**

#### Issue
Backend API endpoints require authentication but frontend doesn't handle auth tokens.

**Location:** `backend/api_app.py` (endpoints with `require_permission` decorator)

**Error Details:**
```python
def create_supplier(supplier_data: dict, current_user: User = Depends(require_permission("write:suppliers"))):
```

**Impact:** High  
**Status:** 🔴 Blocks Production Use

**Recommended Fix:**
1. Implement login/authentication in frontend
2. Store JWT tokens in localStorage
3. Add Authorization header to all API requests
4. Handle 401/403 responses

---

### 7. **Environment Variables Not Configured**

#### Issue
Email notification system requires environment variables that may not be set.

**Location:** `backend/supplier_notification_system.py`

**Required Variables:**
- `SMTP_SERVER`
- `SMTP_PORT`
- `COMPANY_EMAIL`
- `EMAIL_PASSWORD`
- `COMPANY_NAME`
- `COMPANY_ADDRESS`
- `COMPANY_PHONE`

**Impact:** Medium  
**Status:** ⚠️ Feature Won't Work

**Recommended Fix:**
Create `.env` file in backend:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
COMPANY_EMAIL=your-email@company.com
EMAIL_PASSWORD=your-app-password
COMPANY_NAME=Your Company Name
COMPANY_ADDRESS=123 Business St, City, State 12345
COMPANY_PHONE=+1-555-0123
```

---

### 8. **CORS Configuration**

#### Issue
Frontend may encounter CORS errors when calling backend API from different port.

**Location:** `backend/api_app.py`

**Impact:** High (in development)  
**Status:** ⚠️ Development Blocker

**Recommended Fix:**
Ensure CORS is properly configured:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 9. **API Base URL Configuration**

#### Issue
Frontend may use wrong API base URL if `VITE_API_URL` not set.

**Location:** `frontend/src/utils/constants.js`

**Current Default:**
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

**Impact:** Medium  
**Status:** ℹ️ Configuration Issue

**Recommended Fix:**
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

---

### 10. **Table Overflow on Mobile**

#### Issue
Supplier table may overflow on small screens without horizontal scroll indicator.

**Location:** `frontend/src/pages/Suppliers.jsx`

**Impact:** Low (UX on mobile)  
**Status:** ⚠️ UI Issue

**Current Code:**
```javascript
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```

**Recommended Enhancement:**
Add scrollbar styling or responsive card layout for mobile.

---

### 11. **Missing Error Boundaries**

#### Issue
No React Error Boundaries implemented - errors crash the entire app.

**Location:** Application-wide

**Impact:** High  
**Status:** 🔴 Production Risk

**Recommended Fix:**
Implement Error Boundary component:
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

### 12. **Database Connection Not Checked**

#### Issue
No health check or graceful handling if database is unavailable.

**Location:** `backend/api_app.py` and database service files

**Impact:** High  
**Status:** 🔴 Critical

**Recommended Fix:**
Add health check endpoint:
```python
@app.get("/health")
def health_check():
    try:
        # Test database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

---

## 🔧 Testing Checklist

- [ ] Test supplier CRUD operations
- [ ] Test restock alert email sending
- [ ] Test purchase order email sending
- [ ] Test dark mode toggle
- [ ] Test responsive layout on mobile
- [ ] Test error handling for failed API calls
- [ ] Test authentication flow
- [ ] Verify all environment variables are set
- [ ] Test CORS configuration
- [ ] Load test with multiple suppliers

---

## 📝 Notes

### Priority Levels
- 🔴 **Critical:** Breaks core functionality
- ⚠️ **Warning:** Impacts UX or specific features
- ℹ️ **Info:** Minor issues or improvements

### Next Steps
1. Create Badge component (Critical)
2. Implement missing API endpoints (High Priority)
3. Set up authentication (High Priority)
4. Configure environment variables (Medium Priority)
5. Add error boundaries (Medium Priority)
6. Fix UI/UX issues (Low Priority)

---

**Last Updated:** November 4, 2025  
**Maintained By:** Development Team
