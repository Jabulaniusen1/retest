# Client Component Database Import Fix

## Problem
Client components (`'use client'`) are importing from `@/lib/supabase/database.ts`, which imports `@/lib/email.ts`, which imports `nodemailer`. The `nodemailer` package requires Node.js built-in modules (`child_process`, `net`, `tls`, etc.) that don't exist in the browser, causing build errors.

## Solution
Replace all direct database imports in client components with the new `apiClient` wrapper from `@/lib/api-client.ts`.

## Files That Need Updating

### 1. components/account-management.tsx
**Current:**
```typescript
import { getAccounts, getAccountTypes, createAccount } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getAccounts(userId)` → `apiClient.getAccounts(userId)`
- `getAccountTypes()` → `apiClient.getAccountTypes()`
- `createAccount(...)` → `apiClient.createAccount(...)`

### 2. components/kyc-verification.tsx
**Current:**
```typescript
import { createKYCVerification, uploadKYCDocument, getKYCVerification } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `createKYCVerification(...)` → `apiClient.createKYCVerification(...)`
- `uploadKYCDocument(...)` → `apiClient.uploadKYCDocument(...)`
- `getKYCVerification(userId)` → `apiClient.getKYCVerification(userId)`

### 3. components/kyc-status.tsx
**Current:**
```typescript
import { getKYCVerifications } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getKYCVerifications(userId)` → `apiClient.getKYCVerifications(userId)`

### 4. components/account-card.tsx
**Current:**
```typescript
import { Card } from '@/lib/supabase/database'
import { getCardsByAccountId } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getCardsByAccountId(accountId)` → `apiClient.getCardsByAccountId(accountId)`

### 5. app/dashboard/page.tsx
**Current:**
```typescript
import { getAccounts, getTransactions } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getAccounts(userId)` → `apiClient.getAccounts(userId)`
- `getTransactions(userId, limit)` → `apiClient.getTransactions(userId, limit)`

### 6. app/dashboard/send-money/page.tsx
**Current:**
```typescript
import { getAccounts, transferMoney, getBeneficiaries, createBeneficiary, findRecipientAccount, getRecentTransfers } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getAccounts(userId)` → `apiClient.getAccounts(userId)`
- `transferMoney(...)` → `apiClient.transferMoney(...)`
- `getBeneficiaries(userId)` → `apiClient.getBeneficiaries(userId)`
- `createBeneficiary(...)` → `apiClient.createBeneficiary(...)`
- `findRecipientAccount(accountNumber)` → `apiClient.findRecipientAccount(accountNumber)`
- `getRecentTransfers(userId, limit)` → `apiClient.getRecentTransfers(userId, limit)`

### 7. app/dashboard/add-money/page.tsx
**Current:**
```typescript
import { getAccounts, depositMoney } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getAccounts(userId)` → `apiClient.getAccounts(userId)`
- `depositMoney(accountId, amount, description)` → `apiClient.depositMoney(accountId, amount, description)`

### 8. app/dashboard/transactions/page.tsx
**Current:**
```typescript
import { getTransactions, searchTransactions } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getTransactions(userId, limit)` → `apiClient.getTransactions(userId, limit)`
- `searchTransactions(...)` → `apiClient.searchTransactions(...)`

### 9. app/dashboard/cards/page.tsx
**Current:**
```typescript
import { getAccounts, getCardsByUserId, updateCardStatus, Card } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getAccounts(userId)` → `apiClient.getAccounts(userId)`
- `getCardsByUserId(userId)` → `apiClient.getCardsByUserId(userId)`
- `updateCardStatus(cardId, status)` → `apiClient.updateCardStatus(cardId, status)`

### 10. app/dashboard/settings/page.tsx
**Current:**
```typescript
import { getProfile, updateProfile } from '@/lib/supabase/database'
```
**Replace with:**
```typescript
import { apiClient } from '@/lib/api-client'
```
**Update calls:**
- `getProfile(userId)` → `apiClient.getProfile(userId)`
- `updateProfile(userId, updates)` → `apiClient.updateProfile(userId, updates)`

## Already Fixed
- ✅ components/sidebar.tsx
- ✅ lib/auth-context.tsx

## API Routes Created
All necessary API routes have been created in `/app/api/` to support the client-side operations.
