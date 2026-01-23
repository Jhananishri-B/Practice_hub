# Portal Feedback Report - Issues Identified

## 🔴 Critical Issues

### 1. **Frontend API Configuration Missing**
**Location:** `frontend/src/config/api.ts`
- **Issue:** `API_BASE_URL` is set to an empty string `''`
- **Impact:** All API calls will fail or point to wrong endpoints
- **Fix Required:** Set to `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'`

### 2. **Database Schema Mismatch**
**Location:** `db/schema_mysql.sql` (lines 27-39)
- **Issue:** The `levels` table is missing two critical columns:
  - `topic_description TEXT`
  - `learning_materials TEXT` (or `JSON`)
- **Impact:** 
  - Errors: `Unknown column 'topic_description' in 'field list'`
  - Errors: `Unknown column 'learning_materials' in 'field list'`
  - Admin cannot save/update level learning materials
  - Frontend cannot display level details properly
- **Fix Required:** Add these columns to the schema or run a migration

### 3. **Database Connection Issues**
**Location:** `backend/src/config/database.ts`
- **Issue:** Frequent `ECONNRESET` and `ECONNREFUSED` errors in logs
- **Impact:** 
  - Intermittent database connection failures
  - API endpoints returning 500 errors
  - Users experiencing random failures
- **Possible Causes:**
  - Database not running
  - Connection pool exhaustion
  - Network issues
  - SSL/TLS configuration problems
- **Fix Required:** 
  - Verify database is running
  - Check connection pool settings
  - Review SSL configuration for cloud databases

### 4. **JSX Syntax Errors**
**Location:** `frontend/src/App.jsx` (lines 159, 167, 176)
- **Issue:** Spaces inside JSX tags (e.g., `< Route`, `< ProtectedRoute >`)
- **Impact:** Potential parsing/rendering issues
- **Fix Required:** Remove spaces: `<Route>`, `<ProtectedRoute>`

### 5. **Hardcoded Development Bypass in Production Code**
**Location:** `frontend/src/context/AuthContext.jsx` (lines 28-50)
- **Issue:** Hardcoded login bypass for admin/user with password '123'
- **Impact:** 
  - Security vulnerability
  - Bypasses actual authentication
  - Should only be in development mode
- **Fix Required:** Wrap in `if (process.env.NODE_ENV === 'development')` or remove entirely

## 🟡 Medium Priority Issues

### 6. **Dynamic Import Issue for deleteQuestions**
**Location:** `backend/src/controllers/adminController.ts` (line 259)
- **Issue:** Using dynamic import `await import('../services/questionService')` which may cause issues
- **Impact:** Error: `deleteQuestions is not a function`
- **Fix Required:** Use static import at top of file

### 7. **Missing Environment Variables**
**Location:** Root directory
- **Issue:** No `.env` files found (may be gitignored, but should have `.env.example`)
- **Impact:** 
  - Developers don't know required environment variables
  - Configuration confusion
- **Fix Required:** Create `.env.example` files for both frontend and backend

### 8. **Inconsistent Database Schema Files**
**Location:** Multiple schema files
- **Issue:** 
  - `db/schema_mysql.sql` - Missing `topic_description` and `learning_materials`
  - `backend/src/schema.sql` - Has these columns
  - `db/schema.sql` - Has these columns
- **Impact:** Confusion about which schema is authoritative
- **Fix Required:** Consolidate schemas or document which one to use

### 9. **Error Handling in API Service**
**Location:** `frontend/src/services/api.ts`
- **Issue:** 401 errors logged but token not cleared, user not redirected
- **Impact:** Users stuck in logged-out state without feedback
- **Fix Required:** Clear token and redirect to login on 401

### 10. **CORS Configuration Too Permissive**
**Location:** `backend/src/app.ts` (lines 32-41)
- **Issue:** CORS allows all origins (`callback(null, true)`)
- **Impact:** Security risk in production
- **Fix Required:** Restrict to specific origins in production

## 🟢 Low Priority / Code Quality Issues

### 11. **Console.log in Production Code**
**Location:** Multiple files
- **Issue:** Debug `console.log` statements left in code
- **Examples:**
  - `backend/src/app.ts` line 46: `console.error('DEBUG: Incoming Request...')`
  - `frontend/src/services/api.ts` lines 16, 18, 28-32: Multiple console logs
- **Fix Required:** Use proper logging library, remove or wrap in dev checks

### 12. **Missing TypeScript Types**
**Location:** `frontend/src/context/AuthContext.jsx`
- **Issue:** Using JavaScript instead of TypeScript (file is `.jsx` not `.tsx`)
- **Impact:** No type safety for auth context
- **Fix Required:** Consider migrating to TypeScript or add PropTypes

### 13. **Inconsistent Error Messages**
**Location:** Various controllers
- **Issue:** Error messages vary in format and detail level
- **Impact:** Difficult debugging, inconsistent user experience
- **Fix Required:** Standardize error response format

### 14. **Missing Input Validation**
**Location:** Various API endpoints
- **Issue:** Some endpoints may not validate all inputs properly
- **Impact:** Potential security vulnerabilities, data integrity issues
- **Fix Required:** Ensure all endpoints use express-validator or similar

### 15. **Database Migration Strategy**
**Location:** `db/migrations/`
- **Issue:** Migrations exist but schema_mysql.sql doesn't match
- **Impact:** Database may not be in expected state after migrations
- **Fix Required:** Ensure migrations are applied and schema matches

## 📋 Summary of Required Fixes

### Immediate Actions:
1. ✅ Fix API_BASE_URL in frontend config
2. ✅ Add missing columns to database schema
3. ✅ Fix JSX syntax errors
4. ✅ Remove or secure dev bypass
5. ✅ Fix deleteQuestions import

### Short-term Actions:
6. Create .env.example files
7. Consolidate database schemas
8. Improve error handling
9. Fix CORS configuration
10. Remove console.logs

### Long-term Improvements:
11. Migrate to TypeScript
12. Standardize error handling
13. Improve input validation
14. Document migration strategy

## 🔧 Recommended Fix Priority

**Priority 1 (Critical - Fix Now):**
- API configuration
- Database schema mismatch
- JSX syntax errors

**Priority 2 (High - Fix Soon):**
- Database connection stability
- Security issues (dev bypass, CORS)
- deleteQuestions function

**Priority 3 (Medium - Fix When Possible):**
- Error handling improvements
- Code quality issues
- Documentation

