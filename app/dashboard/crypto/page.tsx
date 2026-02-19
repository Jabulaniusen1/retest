'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { CryptoBalance, CryptoTransaction } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpRight, ArrowDownLeft, TrendingUp, Wallet, Send, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CRYPTO_INFO = {
  BTC: { name: 'Bitcoin', color: 'text-orange-500', price: 65000 },
  ETH: { name: 'Ethereum', color: 'text-blue-500', price: 3500 },
  USDT: { name: 'Tether', color: 'text-green-500', price: 1 },
  BNB: { name: 'Binance Coin', color: 'text-yellow-500', price: 450 },
  SOL: { name: 'Solana', color: 'text-purple-500', price: 140 },
  XRP: { name: 'Ripple', color: 'text-gray-500', price: 0.65 },
  ADA: { name: 'Cardano', color: 'text-blue-400', price: 0.55 },
  DOGE: { name: 'Dogecoin', color: 'text-yellow-400', price: 0.15 }
}

export default function CryptoPage() {
  const { user } = useAuth()
  const [balances, setBalances] = useState<CryptoBalance[]>([])
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('BTC')
  const [buyAmount, setBuyAmount] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendAddress, setSendAddress] = useState('')
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const [sendDialogOpen, setSendDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const [balancesData, transactionsData] = await Promise.all([
        apiClient.getCryptoBalances(user.id),
        apiClient.getCryptoTransactions(user.id)
      ])
      setBalances(balancesData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error fetching crypto data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCrypto = async () => {
    if (!user || !buyAmount) return
    try {
      const amount = parseFloat(buyAmount)
      const usdValue = amount * CRYPTO_INFO[selectedCurrency as keyof typeof CRYPTO_INFO].price
      await apiClient.buyCrypto(user.id, selectedCurrency, amount, usdValue)
      setBuyAmount('')
      setBuyDialogOpen(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleSendCrypto = async () => {
    if (!user || !sendAmount || !sendAddress) return
    try {
      await apiClient.sendCrypto(user.id, selectedCurrency, parseFloat(sendAmount), sendAddress)
      setSendAmount('')
      setSendAddress('')
      setSendDialogOpen(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getTotalUSDValue = () => {
    if (!balances || balances.length === 0) return 0
    return balances.reduce((total, balance) => {
      const price = CRYPTO_INFO[balance.currency as keyof typeof CRYPTO_INFO]?.price || 0
      return total + (balance.balance * price)
    }, 0)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crypto Wallet</h1>
          <p className="text-muted-foreground mt-1">Manage your cryptocurrency portfolio</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Buy Crypto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buy Cryptocurrency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Cryptocurrency</label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CRYPTO_INFO).map(([symbol, info]) => (
                        <SelectItem key={symbol} value={symbol}>
                          {symbol} - {info.name} (${info.price.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  {buyAmount && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ ${(parseFloat(buyAmount) * CRYPTO_INFO[selectedCurrency as keyof typeof CRYPTO_INFO].price).toLocaleString()}
                    </p>
                  )}
                </div>
                <Button onClick={handleBuyCrypto} className="w-full">
                  Buy {selectedCurrency}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Cryptocurrency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Cryptocurrency</label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {balances && balances.length > 0 ? (
                        balances.map((balance) => (
                          <SelectItem key={balance.currency} value={balance.currency}>
                            {balance.currency} - Balance: {balance.balance.toFixed(8)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="BTC" disabled>No crypto balances available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Address</label>
                  <Input
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <Input
                    type="number"
                    step="0.00000001"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Button onClick={handleSendCrypto} className="w-full">
                  Send {selectedCurrency}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Total Portfolio Value</span>
        </div>
        <div className="text-4xl font-bold text-foreground">
          ${getTotalUSDValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(CRYPTO_INFO).map(([symbol, info]) => {
          const balance = balances.find(b => b.currency === symbol)
          const amount = balance?.balance || 0
          const usdValue = amount * info.price

          return (
            <Card key={symbol} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center text-white font-bold`}>
                    {symbol[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{symbol}</div>
                    <div className="text-xs text-muted-foreground">{info.name}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {amount.toFixed(8)}
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${info.price.toLocaleString()} per {symbol}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    tx.type === 'buy' || tx.type === 'receive' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.type === 'buy' || tx.type === 'receive' ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground capitalize">{tx.type} {tx.currency}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString()}
                    </div>
                    {tx.transaction_hash && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {tx.transaction_hash.substring(0, 16)}...
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.type === 'buy' || tx.type === 'receive' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {tx.type === 'buy' || tx.type === 'receive' ? '+' : '-'}{tx.amount.toFixed(8)} {tx.currency}
                  </div>
                  {tx.usd_value && (
                    <div className="text-sm text-muted-foreground">
                      ${tx.usd_value.toLocaleString()}
                    </div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
