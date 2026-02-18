'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { createClient } from '@/lib/supabase/client'
import type { Card } from '@/lib/supabase/database'
import { Card as CardComponent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Lock, Unlock, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Account } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export default function CardsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showLockDialog, setShowLockDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  
  // Password verification for viewing card details
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verifyingPassword, setVerifyingPassword] = useState(false)
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())
  const [selectedCardToReveal, setSelectedCardToReveal] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          const [accs, crds] = await Promise.all([
            apiClient.getAccounts(user.id),
            apiClient.getCardsByUserId(user.id)
          ])
          setAccounts(accs)
          setCards(crds)
        } catch (error) {
          console.error('Error fetching data:', error)
          toast({
            title: 'Error',
            description: 'Failed to load cards',
            variant: 'destructive'
          })
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user, toast])

  const handleLockCard = async (cardId: string) => {
    setActionLoading(true)
    try {
      const card = cards.find(c => c.id === cardId)
      const newStatus = card?.status === 'locked' ? 'active' : 'locked'
      await apiClient.updateCardStatus(cardId, newStatus)
      setCards(cards.map(c => c.id === cardId ? { ...c, status: newStatus } : c))
      toast({
        title: 'Success',
        description: `Card ${newStatus === 'locked' ? 'locked' : 'unlocked'} successfully`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update card status',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
      setShowLockDialog(false)
    }
  }

  const handleReportCard = async (cardId: string) => {
    setActionLoading(true)
    try {
      await apiClient.updateCardStatus(cardId, 'cancelled')
      setCards(cards.map(c => c.id === cardId ? { ...c, status: 'cancelled' } : c))
      toast({
        title: 'Card Reported',
        description: 'Your card has been cancelled. A replacement will be sent to you.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to report card',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(false)
      setShowReportDialog(false)
    }
  }

  const handleRevealCardDetails = (cardId: string) => {
    setSelectedCardToReveal(cardId)
    setShowPasswordDialog(true)
  }

  const handleVerifyPassword = async () => {
    if (!password || !user) return
    
    setVerifyingPassword(true)
    try {
      // Verify password by attempting to sign in with current email and provided password
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      })
      
      if (error) {
        toast({
          title: 'Incorrect Password',
          description: 'The password you entered is incorrect.',
          variant: 'destructive'
        })
        return
      }
      
      // Password is correct, reveal the card
      if (selectedCardToReveal) {
        setRevealedCards(prev => new Set([...prev, selectedCardToReveal]))
        toast({
          title: 'Card Details Revealed',
          description: 'You can now view the full card details.'
        })
      }
      
      setShowPasswordDialog(false)
      setPassword('')
      setSelectedCardToReveal(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify password',
        variant: 'destructive'
      })
    } finally {
      setVerifyingPassword(false)
    }
  }

  const maskCardNumber = (cardNumber: string) => {
    const parts = cardNumber.split(' ')
    if (parts.length === 4) {
      return `•••• •••• •••• ${parts[3]}`
    }
    return '•••• •••• •••• ••••'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading cards...</p>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-foreground/60 mb-4">No cards found</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const primaryCard = cards[0]

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">My Cards</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        {cards.map((card, index) => (
          <div key={card.id}>
            <h2 className="text-xl font-bold text-foreground mb-4">
              {index === 0 ? 'Primary Card' : `Card ${index + 1}`}
            </h2>
            <CardComponent className={`p-8 relative overflow-hidden ${
              card.status === 'cancelled' 
                ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white opacity-60'
                : card.status === 'locked'
                ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 text-white'
                : 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
            }`}>
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>

              {card.status === 'cancelled' && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  CANCELLED
                </div>
              )}
              {card.status === 'locked' && (
                <div className="absolute top-4 right-4 bg-yellow-900 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  LOCKED
                </div>
              )}

              <div className="relative z-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm opacity-80 mb-2">Card Number</p>
                    <p className="text-2xl font-mono tracking-wider">
                      {revealedCards.has(card.id) ? card.card_number : maskCardNumber(card.card_number)}
                    </p>
                  </div>
                  {!revealedCards.has(card.id) && card.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevealCardDetails(card.id)}
                      className="text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Reveal
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs opacity-80 mb-2">Card Holder</p>
                    <p className="font-semibold text-lg uppercase">
                      {user?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-80 mb-2">Expires</p>
                    <p className="font-semibold text-lg">
                      {revealedCards.has(card.id) ? card.expiry_date : '••/••'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div>
                    <p className="text-xs opacity-80">Type</p>
                    <p className="font-semibold capitalize">{card.card_type} Card</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs opacity-80">Daily Limit</p>
                    <p className="font-semibold">${card.daily_limit.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </CardComponent>

            {/* Card Actions */}
            {card.status !== 'cancelled' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setSelectedCardId(card.id)
                    setShowLockDialog(true)
                  }}
                  disabled={actionLoading}
                >
                  {card.status === 'locked' ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Unlock Card
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock Card
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    setSelectedCardId(card.id)
                    setShowReportDialog(true)
                  }}
                  disabled={actionLoading}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Lost/Stolen
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Card Details */}
        {cards.map((card) => (
          <CardComponent key={card.id} className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Card Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/60">Card Number</label>
                  <p className="font-mono text-foreground">
                    {revealedCards.has(card.id) ? card.card_number : maskCardNumber(card.card_number)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-foreground/60">CVV</label>
                  <p className="font-mono text-foreground">
                    {revealedCards.has(card.id) ? card.cvv : '•••'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/60">
                    Expiration Date
                  </label>
                  <p className="font-mono text-foreground">
                    {revealedCards.has(card.id) ? card.expiry_date : '••/••'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-foreground/60">
                    Card Type
                  </label>
                  <p className="capitalize text-foreground">
                    {card.card_type}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-foreground/60">
                    Status
                  </label>
                  <p className="capitalize text-foreground">
                    {card.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-foreground/60">
                    Daily Limit
                  </label>
                  <p className="text-foreground">
                    ${card.daily_limit.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardComponent>
        ))}

        {/* Add New Card */}
        <CardComponent className="p-6 border-2 border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Add Card</h3>
              <p className="text-sm text-foreground/60 mt-1">
                Request a new card for your account
              </p>
            </div>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Request Card
            </Button>
          </div>
        </CardComponent>
      </div>

      {/* Lock/Unlock Dialog */}
      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cards.find(c => c.id === selectedCardId)?.status === 'locked' ? 'Unlock Card' : 'Lock Card'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cards.find(c => c.id === selectedCardId)?.status === 'locked'
                ? 'This will allow transactions on your card again.'
                : 'This will prevent any transactions from being made with this card. You can unlock it anytime.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCardId && handleLockCard(selectedCardId)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Card Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Card as Lost or Stolen?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately cancel your card and prevent any transactions. A replacement card will be sent to your registered address within 5-7 business days. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCardId && handleReportCard(selectedCardId)}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Processing...' : 'Report Card'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Password</DialogTitle>
            <DialogDescription>
              For security purposes, please enter your password to view full card details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleVerifyPassword()
                    }
                  }}
                  disabled={verifyingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false)
                setPassword('')
                setSelectedCardToReveal(null)
              }}
              disabled={verifyingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyPassword}
              disabled={!password || verifyingPassword}
            >
              {verifyingPassword ? 'Verifying...' : 'Verify & Reveal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
