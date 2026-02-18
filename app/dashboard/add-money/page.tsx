'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Account } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Step = 'select' | 'amount' | 'success'

export default function AddMoneyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('select')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchAccounts() {
      if (user) {
        try {
          const accs = await apiClient.getAccounts(user.id)
          setAccounts(accs)
          if (accs.length > 0) {
            setSelectedAccountId(accs[0].id)
          }
        } catch (error) {
          console.error('Error fetching accounts:', error)
        }
      }
    }
    fetchAccounts()
  }, [user])

  if (!user) return null

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)

  const handleNextStep = () => {
    setError('')

    if (currentStep === 'select') {
      if (!selectedAccountId) {
        setError('Please select an account')
        return
      }
      setCurrentStep('amount')
    } else if (currentStep === 'amount') {
      const amountNum = parseFloat(amount)
      if (!amount || isNaN(amountNum)) {
        setError('Please enter a valid amount')
        return
      }
      if (amountNum <= 0) {
        setError('Amount must be greater than 0')
        return
      }
      if (amountNum > 100000) {
        setError('Maximum deposit amount is $100,000')
        return
      }
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const amountNum = parseFloat(amount)
      await apiClient.depositMoney(
        selectedAccountId,
        amountNum,
        description || 'Deposit'
      )
      setCurrentStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-3xl font-bold text-foreground">Add Money</h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8 flex gap-4">
        {(['select', 'amount', 'success'] as const).map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : ['select', 'amount'].includes(currentStep) &&
                    ['select', 'amount'].indexOf(step as any) <
                      ['select', 'amount'].indexOf(currentStep as any)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground/60'
              }`}
            >
              {idx + 1}
            </div>
            {idx < 2 && <div className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Select Account Step */}
        {currentStep === 'select' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Select Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deposit to Account
                </label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">{account.account_type?.display_name || 'Account'} - {account.account_number}</span>
                          <span className="ml-4 text-foreground/60">${account.balance.toFixed(2)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button onClick={handleNextStep} className="w-full">
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Amount Step */}
        {currentStep === 'amount' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              How much do you want to add?
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60">
                    $
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                    autoFocus
                    step="0.01"
                    min="0"
                    max="100000"
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-2">
                  Maximum: $100,000.00
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this for?"
                />
              </div>
              {selectedAccount && (
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm text-foreground/60 mb-1">Depositing to</p>
                  <p className="font-semibold text-foreground capitalize">
                    {selectedAccount.account_type?.display_name || 'Account'} Account
                  </p>
                  <p className="text-sm text-foreground/60">
                    {selectedAccount.account_number}
                  </p>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('select')}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Add Money'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <Card className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Money Added!
            </h2>
            <p className="text-foreground/60 mb-8">
              ${parseFloat(amount).toFixed(2)} has been added to your account
            </p>

            <div className="mb-8 rounded-lg bg-secondary p-6 text-left">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Account</span>
                  <span className="font-semibold text-foreground capitalize">
                    {selectedAccount?.account_type?.display_name || 'Account'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Amount</span>
                  <span className="font-semibold text-foreground">
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between">
                  <span className="text-foreground/60">New Balance</span>
                  <span className="font-semibold text-primary">
                    ${selectedAccount ? (selectedAccount.balance + parseFloat(amount)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep('select')
                  setAmount('')
                  setDescription('')
                }}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add More
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
