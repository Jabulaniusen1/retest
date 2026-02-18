'use client'

import { Account } from '@/types'
import type { Card } from '@/lib/supabase/database'
import { CreditCard, Wifi, Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import { formatCurrency } from '@/lib/utils'

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  const [card, setCard] = useState<Card | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [verifyingPassword, setVerifyingPassword] = useState(false)

  useEffect(() => {
    async function fetchCard() {
      try {
        const cards = await apiClient.getCardsByAccountId(account.id)
        if (cards.length > 0) {
          setCard(cards[0])
        }
      } catch (error) {
        console.error('Error fetching card:', error)
      }
    }
    fetchCard()
  }, [account.id])

  const maskCardNumber = (cardNumber: string) => {
    const parts = cardNumber.split(' ')
    if (parts.length === 4) {
      return `•••• •••• •••• ${parts[3]}`
    }
    return '•••• •••• •••• ••••'
  }

  const handleRevealDetails = () => {
    setShowPasswordDialog(true)
  }

  const handleVerifyPassword = async () => {
    if (!password || !user) return
    
    setVerifyingPassword(true)
    try {
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
      
      setShowDetails(true)
      toast({
        title: 'Card Details Revealed',
        description: 'You can now view the full card details.'
      })
      
      setShowPasswordDialog(false)
      setPassword('')
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
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-foreground/60 mb-1">Card Number</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {showDetails && card ? card.card_number : (card ? maskCardNumber(card.card_number) : '•••• •••• •••• ••••')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!showDetails && card && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRevealDetails}
                className="h-8 px-2"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <CreditCard className="h-6 w-6 text-foreground/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-foreground/60 mb-1">Expires</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {showDetails && card ? card.expiry_date : '••/••'}
            </p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 mb-1">CVV</p>
            <p className="text-sm font-mono font-semibold text-foreground">
              {showDetails && card ? card.cvv : '•••'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-primary/20">
          <div>
            <p className="text-xs text-foreground/60">Balance</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(account.balance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground/60">Type</p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {account.account_type?.display_name || 'Account'} Account
            </p>
          </div>
        </div>
      </div>

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
    </>
  )
}
