'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Account, Transaction } from '@/types'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountCard } from '@/components/account-card'
import { TransactionItem } from '@/components/transaction-item'
import { Send, Plus, Eye, EyeOff, Wallet, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showBalance, setShowBalance] = useState(true)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          const [accs, trans] = await Promise.all([
            apiClient.getAccounts(user.id),
            apiClient.getTransactions(user.id, 5)
          ])
          setAccounts(accs || [])
          setTransactions(trans || [])
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleCreateAccount = async () => {
    if (!user) return
    
    setCreating(true)
    try {
      await apiClient.createAccount(user.id, 'checking', 'My Checking Account')
      
      // Refresh accounts
      const accs = await apiClient.getAccounts(user.id)
      setAccounts(accs || [])
    } catch (error) {
      console.error('Error creating account:', error)
    } finally {
      setCreating(false)
    }
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Wallet className="h-16 w-16 text-foreground/40 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">No Accounts Yet</h2>
          <p className="text-foreground/60 mb-6 text-center max-w-md">
            Get started by creating your first checking account
          </p>
          <Button 
            onClick={handleCreateAccount} 
            disabled={creating}
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            {creating ? 'Creating Account...' : 'Create Checking Account'}
          </Button>
        </div>
      </div>
    )
  }

  const primaryAccount = accounts[0]
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="p-4 md:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-foreground/60 mt-1">
          Here's your financial overview
        </p>
      </div>

      {/* Balance Card */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm text-foreground/60 mb-2">Total Balance</p>
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-bold text-foreground">
                    {showBalance ? (
                      formatCurrency(totalBalance)
                    ) : (
                      '••••••'
                    )}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-foreground/60"
                  >
                    {showBalance ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/60 mb-1">{accounts.length} Account{accounts.length > 1 ? 's' : ''}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-foreground/80">
                    {primaryAccount.account_number}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(primaryAccount.account_number)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="h-8 w-8 p-0 text-foreground/60 hover:text-foreground"
                    title="Copy account number"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-primary/20 pt-6">
              <AccountCard account={primaryAccount} />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Button
            onClick={() => router.push('/dashboard/send-money')}
            className="w-full h-12 text-base font-semibold"
          >
            <Send className="mr-2 h-5 w-5" />
            Send Money
          </Button>
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => router.push('/dashboard/add-money')}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Money
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">
            Recent Transactions
          </h3>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/transactions')}
          >
            View All
          </Button>
        </div>

        <Card className="overflow-hidden">
          {transactions.length > 0 ? (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-foreground/60">
              No transactions yet
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
