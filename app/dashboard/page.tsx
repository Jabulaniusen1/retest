'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Account, CryptoBalance } from '@/types'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Plus, Eye, EyeOff, Wallet, ArrowDownUp, CreditCard, Bitcoin, TrendingUp, Gift, Lightbulb, MessageCircle, Mail, Bell, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

const CRYPTO_PRICES: Record<string, number> = {
  BTC: 65000, ETH: 3500, USDT: 1, BNB: 450, SOL: 140, XRP: 0.65, ADA: 0.55, DOGE: 0.15
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cryptoBalances, setCryptoBalances] = useState<CryptoBalance[]>([])
  const [showBalance, setShowBalance] = useState(true)
  const [balanceType, setBalanceType] = useState<'fiat' | 'crypto'>('fiat')
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          const [accs, crypto] = await Promise.all([
            apiClient.getAccounts(user.id),
            apiClient.getCryptoBalances(user.id)
          ])
          setAccounts(accs || [])
          setCryptoBalances(crypto || [])
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

  const currentAccount = accounts[currentAccountIndex] || accounts[0]
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  const totalCryptoValue = cryptoBalances.reduce((sum, balance) => {
    const price = CRYPTO_PRICES[balance.currency] || 0
    return sum + (balance.balance * price)
  }, 0)

  const displayBalance = balanceType === 'fiat' ? totalBalance : totalCryptoValue
  const displayAccountInfo = balanceType === 'fiat' 
    ? `${currentAccount?.account_type?.display_name || 'Account'} - ${currentAccount?.account_number?.slice(-4) || ''}` 
    : `${cryptoBalances.length} Crypto Assets`

  // Check if any account is frozen
  const hasFrozenAccount = accounts.some(acc => acc.status === 'frozen')

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Frozen Account Warning */}
      {hasFrozenAccount && (
        <div className="mb-4 md:mb-6 p-4 md:p-6 bg-red-500/10 border-2 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-bold text-red-600 mb-2">Account Suspended</h3>
              <p className="text-sm md:text-base text-red-700 mb-3">
                We have detected unusual activities on your account coming from multiple locations, contact support
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-base md:text-lg font-bold text-white">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">Good Morning 👋</h1>
            <p className="text-xs md:text-sm text-muted-foreground">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="icon" className="hover:bg-accent rounded-full" onClick={() => router.push('/dashboard/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-accent rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>

      {/* Balance Card - Swipeable */}
      <div className="mb-4 md:mb-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 border-0 text-white p-4 md:p-6">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div>
              <p className="text-xs md:text-sm opacity-90 mb-1">CAPITAL CITY BANK</p>
              <p className="text-xs md:text-sm opacity-90">{user?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm opacity-90 mb-1">{balanceType === 'fiat' ? 'Fiat Account' : 'Crypto Wallet'}</p>
              <p className="text-xs md:text-sm font-mono">•••• {balanceType === 'fiat' ? (currentAccount?.account_number?.slice(-4) || '****') : '****'}</p>
            </div>
          </div>

          <div className="my-4 md:my-6">
            <p className="text-xs md:text-sm opacity-90 mb-2">Available Balance</p>
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-2xl md:text-4xl font-bold">
                {showBalance ? formatCurrency(displayBalance) : '••••••'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:bg-white/20"
              >
                {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-xs">Active</span>
            </div>
            <p className="text-xs opacity-75">Last updated: {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-32 w-32 md:h-40 md:w-40 rounded-full bg-white/10"></div>
          <div className="absolute -right-5 top-16 md:top-20 h-20 w-20 md:h-24 md:w-24 rounded-full bg-white/5"></div>
        </Card>

        {/* Balance Type Toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setBalanceType('fiat')}
            className={`h-2 w-2 rounded-full transition-all ${
              balanceType === 'fiat' ? 'bg-primary w-6' : 'bg-muted'
            }`}
          />
          <button
            onClick={() => setBalanceType('crypto')}
            className={`h-2 w-2 rounded-full transition-all ${
              balanceType === 'crypto' ? 'bg-primary w-6' : 'bg-muted'
            }`}
          />
        </div>
        <p className="text-center text-xs md:text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
          <ArrowDownUp className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Swipe to switch between accounts</span>
          <span className="sm:hidden">Switch accounts</span>
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
        <button
          onClick={() => router.push('/dashboard/add-money')}
          className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl md:rounded-2xl bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-md"
        >
          <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="h-4 w-4 md:h-6 md:w-6 text-white" />
          </div>
          <span className="text-[10px] md:text-xs font-medium text-white">Top Up</span>
        </button>

        <button
          onClick={() => router.push('/dashboard/send-money')}
          className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors shadow-md"
        >
          <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Send className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="text-[10px] md:text-xs font-medium text-foreground">Send</span>
        </button>

        <button
          onClick={() => router.push('/dashboard/add-money')}
          className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors shadow-md"
        >
          <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowDownUp className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="text-[10px] md:text-xs font-medium text-foreground">Receive</span>
        </button>

        <button
          onClick={() => router.push('/dashboard/accounts')}
          className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors shadow-md"
        >
          <div className="h-8 w-8 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="text-[10px] md:text-xs font-medium text-foreground">More</span>
        </button>
      </div>

      {/* Financial Services */}
      <div className="mb-6 md:mb-8">

        <div className="grid grid-cols-2 gap-4">
          <Card
            className="p-3 md:p-4 bg-card border-border hover:shadow-md cursor-pointer transition-all"
            onClick={() => router.push('/dashboard/crypto')}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Bitcoin className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">Crypto Wallet</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">{cryptoBalances.length} assets</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-3 md:p-4 bg-card border-border hover:shadow-md cursor-pointer transition-all"
            onClick={() => router.push('/dashboard/loans')}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">Loans</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Apply now</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-3 md:p-4 bg-card border-border hover:shadow-md cursor-pointer transition-all"
            onClick={() => router.push('/dashboard/virtual-cards')}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">Virtual Cards</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Create card</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-3 md:p-4 bg-card border-border hover:shadow-md cursor-pointer transition-all"
            onClick={() => router.push('/dashboard/grants-refunds')}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Gift className="h-4 w-4 md:h-5 md:w-5 text-pink-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">Grants & Refunds</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Track status</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-3 md:p-4 bg-card border-border hover:shadow-md cursor-pointer transition-all"
            onClick={() => router.push('/dashboard/insights')}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">Insights</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">View analytics</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-3 md:p-4 bg-card border-border hover:shadow-md cursor-pointer transition-all"
            onClick={() => router.push('/dashboard/cards')}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">Debit Cards</p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Manage cards</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Support Section */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-lg font-bold text-foreground mb-3 md:mb-4">Need Help?</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 bg-gradient-to-br from-blue-500 to-blue-600 border-0 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-white">Live Chat</p>
                <p className="text-[10px] md:text-xs text-blue-100 truncate">Chat with us now</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 md:p-4 bg-gradient-to-br from-purple-500 to-purple-600 border-0 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-white">Email Support</p>
                <p className="text-[10px] md:text-xs text-purple-100 truncate">support@capitalbank.com</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
