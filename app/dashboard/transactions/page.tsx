'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Transaction } from '@/types'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransactionItem } from '@/components/transaction-item'
import { ArrowLeft, Filter, Download, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type FilterType = 'all' | 'transfer' | 'deposit' | 'withdrawal' | 'payment'

function exportToCSV(transactions: Transaction[], filename: string) {
  const headers = ['Date', 'Type', 'Description', 'Recipient', 'Amount', 'Status', 'Reference']
  const rows = transactions.map(t => [
    new Date(t.created_at).toLocaleDateString(),
    t.transaction_type,
    t.description || '',
    t.recipient_name || '',
    t.amount.toFixed(2),
    t.status,
    t.reference_number || ''
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function TransactionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      if (user) {
        try {
          const trans = await apiClient.getTransactions(user.id)
          setTransactions(trans)
          setFilteredTransactions(trans)
        } catch (error) {
          console.error('Error fetching transactions:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchTransactions()
  }, [user])

  useEffect(() => {
    let filtered = transactions

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filter)
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (startDate) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(startDate))
    }

    if (endDate) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(endDate))
    }

    if (minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(minAmount))
    }

    if (maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(maxAmount))
    }

    setFilteredTransactions(filtered)
  }, [transactions, filter, searchTerm, startDate, endDate, minAmount, maxAmount])

  const handleExport = () => {
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(filteredTransactions, filename)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStartDate('')
    setEndDate('')
    setMinAmount('')
    setMaxAmount('')
    setFilter('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Transaction History
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
              <span className="sm:hidden">Filters</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredTransactions.length === 0}
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by description, recipient, or reference number..."
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Min Amount
              </label>
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Amount
              </label>
              <Input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Type Filters */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-3">Filter by Type</p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">All ({transactions.length})</span>
            <span className="sm:hidden">All</span>
          </Button>
          <Button
            variant={filter === 'transfer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('transfer')}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Transfers ({transactions.filter(t => t.transaction_type === 'transfer').length})</span>
            <span className="sm:hidden">Transfers</span>
          </Button>
          <Button
            variant={filter === 'deposit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('deposit')}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Deposits ({transactions.filter(t => t.transaction_type === 'deposit').length})</span>
            <span className="sm:hidden">Deposits</span>
          </Button>
          <Button
            variant={filter === 'payment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('payment')}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Payments ({transactions.filter(t => t.transaction_type === 'payment').length})</span>
            <span className="sm:hidden">Payments</span>
          </Button>
          <Button
            variant={filter === 'withdrawal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('withdrawal')}
            className="text-xs sm:text-sm col-span-2 sm:col-span-1"
          >
            <span className="hidden sm:inline">Withdrawals ({transactions.filter(t => t.transaction_type === 'withdrawal').length})</span>
            <span className="sm:hidden">Withdrawals</span>
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-foreground/60">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>

      {/* Transactions List */}
      <Card className="overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-foreground/60">
            <p className="mb-2">No transactions found</p>
            {(searchTerm || startDate || endDate || minAmount || maxAmount || filter !== 'all') && (
              <Button variant="link" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
