'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { VirtualCard, Account } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Plus, Lock, Unlock, XCircle, Eye, EyeOff } from 'lucide-react'

export default function VirtualCardsPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<VirtualCard[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [cardHolderName, setCardHolderName] = useState('')
  const [spendingLimit, setSpendingLimit] = useState('')
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const [cardsData, accountsData] = await Promise.all([
        apiClient.getVirtualCards(user.id),
        apiClient.getAccounts(user.id)
      ])
      setCards(cardsData)
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCard = async () => {
    if (!user || !selectedAccountId || !cardHolderName) return
    try {
      await apiClient.createVirtualCard(
        user.id,
        selectedAccountId,
        cardHolderName,
        spendingLimit ? parseFloat(spendingLimit) : undefined
      )
      setCardHolderName('')
      setSpendingLimit('')
      setCreateDialogOpen(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleUpdateCardStatus = async (cardId: string, status: string) => {
    try {
      await apiClient.updateVirtualCardStatus(cardId, status)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const toggleCardVisibility = (cardId: string) => {
    setVisibleCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const maskCardNumber = (number: string) => {
    return `•••• •••• •••• ${number.slice(-4)}`
  }

  const formatCardNumber = (number: string) => {
    return number.match(/.{1,4}/g)?.join(' ') || number
  }

  const getCardGradient = (index: number) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500'
    ]
    return gradients[index % gradients.length]
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Virtual Cards</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Create and manage virtual debit cards</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Virtual Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Virtual Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Link to Account</label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type?.display_name} - {account.account_number} (${account.balance.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                <Input
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  placeholder="JOHN DOE"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Spending Limit (Optional)</label>
                <Input
                  type="number"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <Button onClick={handleCreateCard} className="w-full">
                Create Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No virtual cards yet</h3>
            <p className="text-muted-foreground mb-4">Create a virtual card for secure online shopping</p>
            <Button onClick={() => setCreateDialogOpen(true)}>Create Virtual Card</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards?.map((card, index) => {
            const isVisible = visibleCards.has(card.id)
            
            return (
              <div key={card.id} className="space-y-4">
                <div className={`relative h-52 rounded-2xl bg-gradient-to-br ${getCardGradient(index)} p-6 text-white shadow-xl`}>
                  <div className="flex items-start justify-between mb-8">
                    <div className="text-sm font-medium opacity-90">Virtual Card</div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      card.status === 'active' ? 'bg-white/20' :
                      card.status === 'frozen' ? 'bg-blue-500/30' :
                      'bg-red-500/30'
                    }`}>
                      {card.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-xl tracking-wider font-mono">
                      {isVisible ? formatCardNumber(card.card_number) : maskCardNumber(card.card_number)}
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs opacity-75 mb-1">CARDHOLDER</div>
                      <div className="text-sm font-medium">{card.card_holder_name}</div>
                    </div>
                    <div>
                      <div className="text-xs opacity-75 mb-1">EXPIRES</div>
                      <div className="text-sm font-medium">
                        {isVisible ? `${String(card.expiry_month).padStart(2, '0')}/${String(card.expiry_year).slice(-2)}` : '••/••'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs opacity-75 mb-1">CVV</div>
                      <div className="text-sm font-medium">
                        {isVisible ? card.cvv : '•••'}
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="p-4">
                  <div className="space-y-3">
                    {card.spending_limit && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Spending Limit</span>
                        <span className="font-medium text-foreground">${card.spending_limit.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => toggleCardVisibility(card.id)}
                      >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {isVisible ? 'Hide' : 'Show'}
                      </Button>
                      
                      {card.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleUpdateCardStatus(card.id, 'frozen')}
                        >
                          <Lock className="h-4 w-4" />
                          Freeze
                        </Button>
                      ) : card.status === 'frozen' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleUpdateCardStatus(card.id, 'active')}
                        >
                          <Unlock className="h-4 w-4" />
                          Unfreeze
                        </Button>
                      ) : null}
                      
                      {card.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this card?')) {
                              handleUpdateCardStatus(card.id, 'cancelled')
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
