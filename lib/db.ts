import { User, Account, Transaction } from '@/types'

const generateAccountNumber = (): string => {
  return Math.random().toString().slice(2, 12)
}

const generateCardNumber = (): string => {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10000).toString().padStart(4, '0'))
    .join(' ')
}

const generateCardExpiry = (): string => {
  const month = Math.floor(Math.random() * 12) + 1
  const year = new Date().getFullYear() + 5
  return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
}

const generateCardCVC = (): string => {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0')
}

// Mock database stored in localStorage
const DB_KEY = 'banking_app_db'

interface DBStore {
  users: User[]
  accounts: Account[]
  transactions: Transaction[]
}

const getDB = (): DBStore => {
  const stored = localStorage.getItem(DB_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return { users: [], accounts: [], transactions: [] }
}

const saveDB = (db: DBStore): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

// Initialize with dummy data
const initializeDummyData = (): void => {
  const db = getDB()
  if (db.users.length > 0) return

  const dummyUser: User = {
    id: '1',
    email: 'demo@example.com',
    name: 'John Doe',
    accountNumber: generateAccountNumber(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  }

  const dummyAccount: Account = {
    id: '1',
    userId: '1',
    accountNumber: dummyUser.accountNumber,
    balance: 25847.50,
    currency: 'USD',
    accountType: 'checking',
    cardNumber: generateCardNumber(),
    cardExpiry: generateCardExpiry(),
    cardCVC: generateCardCVC(),
    createdAt: dummyUser.createdAt,
  }

  const dummyTransactions: Transaction[] = [
    {
      id: '1',
      fromAccountId: '1',
      type: 'deposit',
      amount: 5000,
      currency: 'USD',
      status: 'completed',
      description: 'Direct deposit salary',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      category: 'income',
    },
    {
      id: '2',
      fromAccountId: '1',
      type: 'withdrawal',
      amount: 150,
      currency: 'USD',
      status: 'completed',
      description: 'Cash withdrawal at ATM',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'cash',
    },
    {
      id: '3',
      fromAccountId: '1',
      type: 'transfer',
      amount: 500,
      recipientName: 'Sarah Smith',
      currency: 'USD',
      status: 'completed',
      description: 'Transfer to savings',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      category: 'transfer',
    },
    {
      id: '4',
      fromAccountId: '1',
      type: 'payment',
      amount: 85.99,
      currency: 'USD',
      status: 'completed',
      description: 'Amazon purchase',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      category: 'shopping',
    },
    {
      id: '5',
      fromAccountId: '1',
      type: 'payment',
      amount: 125.00,
      currency: 'USD',
      status: 'completed',
      description: 'Netflix subscription',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      category: 'subscription',
    },
    {
      id: '6',
      fromAccountId: '1',
      type: 'transfer',
      amount: 250,
      recipientName: 'Mike Johnson',
      currency: 'USD',
      status: 'completed',
      description: 'Dinner split',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      category: 'transfer',
    },
  ]

  db.users = [dummyUser]
  db.accounts = [dummyAccount]
  db.transactions = dummyTransactions

  saveDB(db)
}

// User functions
export const getUserByEmail = (email: string): User | undefined => {
  const db = getDB()
  return db.users.find((u) => u.email === email)
}

export const getUserById = (id: string): User | undefined => {
  const db = getDB()
  return db.users.find((u) => u.id === id)
}

export const createUser = (
  email: string,
  password: string,
  name: string
): User => {
  const db = getDB()
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    accountNumber: generateAccountNumber(),
    password, // In real app, this would be hashed
    createdAt: new Date(),
  }

  const newAccount: Account = {
    id: Date.now().toString(),
    userId: newUser.id,
    accountNumber: newUser.accountNumber,
    balance: 10000, // New users get $10k
    currency: 'USD',
    accountType: 'checking',
    cardNumber: generateCardNumber(),
    cardExpiry: generateCardExpiry(),
    cardCVC: generateCardCVC(),
    createdAt: new Date(),
  }

  db.users.push(newUser)
  db.accounts.push(newAccount)
  saveDB(db)

  return newUser
}

// Account functions
export const getAccountByUserId = (userId: string): Account | undefined => {
  const db = getDB()
  return db.accounts.find((a) => a.userId === userId)
}

export const updateAccountBalance = (
  accountId: string,
  newBalance: number
): void => {
  const db = getDB()
  const account = db.accounts.find((a) => a.id === accountId)
  if (account) {
    account.balance = newBalance
    saveDB(db)
  }
}

// Transaction functions
export const getTransactionsByUserId = (
  userId: string,
  limit?: number
): Transaction[] => {
  const db = getDB()
  const account = db.accounts.find((a) => a.userId === userId)
  if (!account) return []

  let transactions = db.transactions.filter(
    (t) => t.fromAccountId === account.id
  )
  transactions = transactions.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (limit) {
    return transactions.slice(0, limit)
  }
  return transactions
}

export const createTransaction = (
  fromAccountId: string,
  toAccountId: string | undefined,
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment',
  amount: number,
  description: string,
  recipientName?: string
): Transaction => {
  const db = getDB()
  const newTransaction: Transaction = {
    id: Date.now().toString(),
    fromAccountId,
    toAccountId,
    type,
    amount,
    currency: 'USD',
    status: 'completed',
    description,
    recipientName,
    createdAt: new Date(),
    category: type,
  }

  db.transactions.push(newTransaction)
  saveDB(db)

  return newTransaction
}

// Initialize dummy data on first load
if (typeof window !== 'undefined') {
  initializeDummyData()
}
