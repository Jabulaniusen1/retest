// Client-side API wrapper to replace direct database imports
// This file can be safely imported in client components

export const apiClient = {
  // Profile operations
  async getProfile(userId: string) {
    const response = await fetch(`/api/profile/${userId}`)
    const data = await response.json()
    return data.profile
  },

  async updateProfile(userId: string, updates: any) {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.profile
  },

  // Account operations
  async getAccounts(userId: string) {
    const response = await fetch(`/api/accounts/${userId}`)
    const data = await response.json()
    return data.accounts
  },

  async getAccountTypes() {
    const response = await fetch('/api/account-types')
    const data = await response.json()
    return data.accountTypes
  },

  async createAccount(userId: string, accountType: string, accountName: string) {
    const response = await fetch('/api/accounts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, accountType, accountName })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.account
  },

  async findRecipientAccount(accountNumber: string) {
    const response = await fetch('/api/accounts/find-recipient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber })
    })
    const data = await response.json()
    return data.account
  },

  // Transaction operations
  async getTransactions(userId: string, limit?: number) {
    const url = limit 
      ? `/api/transactions/${userId}?limit=${limit}`
      : `/api/transactions/${userId}`
    const response = await fetch(url)
    const data = await response.json()
    return data.transactions
  },

  async searchTransactions(userId: string, query?: string, startDate?: string, endDate?: string, type?: string, limit?: number) {
    const response = await fetch('/api/transactions/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, query, startDate, endDate, type, limit })
    })
    const data = await response.json()
    return data.transactions
  },

  async transferMoney(fromAccountId: string, toAccountId: string, amount: number, description?: string) {
    const response = await fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAccountId, toAccountId, amount, description })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.transaction
  },

  async depositMoney(accountId: string, amount: number, description?: string) {
    const response = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, amount, description })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.transaction
  },

  async getRecentTransfers(userId: string, limit?: number) {
    const response = await fetch('/api/transfers/recent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, limit })
    })
    const data = await response.json()
    return data.transfers
  },

  // Beneficiary operations
  async getBeneficiaries(userId: string) {
    const response = await fetch(`/api/beneficiaries/${userId}`)
    const data = await response.json()
    return data.beneficiaries
  },

  async createBeneficiary(userId: string, accountNumber: string, accountName: string, bankName?: string) {
    const response = await fetch('/api/beneficiaries/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, accountNumber, accountName, bankName })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.beneficiary
  },

  // Card operations
  async getCardsByUserId(userId: string) {
    const response = await fetch(`/api/cards/user/${userId}`)
    const data = await response.json()
    return data.cards
  },

  async getCardsByAccountId(accountId: string) {
    const response = await fetch(`/api/cards/account/${accountId}`)
    const data = await response.json()
    return data.cards
  },

  async updateCardStatus(cardId: string, status: string) {
    const response = await fetch('/api/cards/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, status })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.card
  },

  // KYC operations
  async getKYCVerifications(userId: string) {
    const response = await fetch(`/api/kyc/verifications/${userId}`)
    const data = await response.json()
    return data.verifications
  },

  async getKYCVerification(userId: string) {
    const response = await fetch(`/api/kyc/${userId}`)
    const data = await response.json()
    return data.kyc
  },

  async createKYCVerification(userId: string, documentType: string, documentNumber: string, fullName: string, dateOfBirth?: string, address?: string) {
    const response = await fetch('/api/kyc/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, documentType, documentNumber, fullName, dateOfBirth, address })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.kyc
  },

  async uploadKYCDocument(verificationId: string, documentType: string, file: any) {
    const response = await fetch('/api/kyc/upload-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId, documentType, file })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data.result
  }
}
