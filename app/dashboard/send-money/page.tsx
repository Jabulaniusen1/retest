'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Account } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Step = 'select-from' | 'recipient' | 'amount' | 'review' | 'success'
type TransferType = 'own' | 'external'

export default function SendMoneyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('select-from')
  const [transferType, setTransferType] = useState<TransferType>('own')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientAccount, setRecipientAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState<any[]>([])
  const [recentTransfers, setRecentTransfers] = useState<any[]>([])
  const [saveBeneficiary, setSaveBeneficiary] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('')
  const [quickAmount, setQuickAmount] = useState('')
  
  // Account verification states
  const [verifiedAccountName, setVerifiedAccountName] = useState('')
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [accountVerified, setAccountVerified] = useState(false)
  const [accountVerificationError, setAccountVerificationError] = useState('')
  const [transferTimestamp, setTransferTimestamp] = useState<Date | null>(null)

  // Transfer limits (BOA-like)
  const TRANSFER_LIMITS = {
    daily: 50000,
    perTransaction: 50000,
    externalDaily: 50000
  }

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          const [accs, bens, recent] = await Promise.all([
            apiClient.getAccounts(user.id),
            apiClient.getBeneficiaries(user.id),
            apiClient.getRecentTransfers(user.id, 5)
          ])
          setAccounts(accs)
          setBeneficiaries(bens)
          setRecentTransfers(recent)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user])

  // Verify account number when it reaches 13 characters
  useEffect(() => {
    const verifyAccount = async () => {
      if (recipientAccount.length === 13 && recipientAccount.startsWith('ACC')) {
        setVerifyingAccount(true)
        setAccountVerificationError('')
        setAccountVerified(false)
        setVerifiedAccountName('')
        
        try {
          const account = await apiClient.findRecipientAccount(recipientAccount)
          
          if (account && account.user?.full_name) {
            setVerifiedAccountName(account.user.full_name)
            setAccountVerified(true)
            setRecipientName(account.user.full_name) // Auto-fill recipient name
          } else {
            setAccountVerificationError('Account not found')
            setAccountVerified(false)
          }
        } catch (error) {
          setAccountVerificationError('Unable to verify account')
          setAccountVerified(false)
        } finally {
          setVerifyingAccount(false)
        }
      } else if (recipientAccount.length < 13) {
        // Reset verification when user modifies the account number
        setVerifiedAccountName('')
        setAccountVerified(false)
        setAccountVerificationError('')
      }
    }
    
    verifyAccount()
  }, [recipientAccount])

  if (!user) return null

  const fromAccount = accounts.find(acc => acc.id === fromAccountId)
  const toAccount = accounts.find(acc => acc.id === toAccountId)

  const handleNextStep = () => {
    setError('')

    if (currentStep === 'select-from') {
      if (!fromAccountId) {
        setError('Please select an account')
        return
      }
      setCurrentStep('recipient')
    } else if (currentStep === 'recipient') {
      if (transferType === 'own') {
        if (!toAccountId) {
          setError('Please select a destination account')
          return
        }
        if (toAccountId === fromAccountId) {
          setError('Cannot transfer to the same account')
          return
        }
      } else {
        if (!recipientName.trim()) {
          setError('Please enter recipient name')
          return
        }
        if (!recipientAccount.trim()) {
          setError('Please enter account number')
          return
        }
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
      if (fromAccount && amountNum > fromAccount.balance) {
        setError('Insufficient balance')
        return
      }
      
      // BOA-like transfer limits
      if (amountNum > TRANSFER_LIMITS.perTransaction) {
        setError(`Transfer amount exceeds limit of $${TRANSFER_LIMITS.perTransaction.toLocaleString()}`)
        return
      }
      
      setCurrentStep('review')
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const amountNum = parseFloat(amount)
      const fee = amountNum * 0.005 // 0.5% fee
      const totalAmount = amountNum + fee

      if (transferType === 'own' && toAccountId) {
        await apiClient.transferMoney(
          fromAccountId,
          toAccountId,
          totalAmount,
          note || 'Transfer between accounts'
        )
      } else {
        // For external transfers, we'll create a transaction without updating external account
        await apiClient.transferMoney(
          fromAccountId,
          '', // No destination account for external
          totalAmount,
          note || `Transfer to ${recipientName}`
        )

        // Save beneficiary if requested
        if (saveBeneficiary && user) {
          await apiClient.createBeneficiary(
            user.id,
            recipientAccount,
            recipientName
          )
        }
      }

      setTransferTimestamp(new Date())
      setCurrentStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
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
        <h1 className="text-3xl font-bold text-foreground">Send Money</h1>
      </div>

      {/* Select From Account Step - Moved before Quick Actions */}
      {currentStep === 'select-from' && (
        <>
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Select Account to Send From
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  From Account
                </label>
                <Select value={fromAccountId} onValueChange={setFromAccountId}>
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

          {/* Who are you sending to? */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Who are you sending to?
            </h2>
            <Tabs value={transferType} onValueChange={(v) => setTransferType(v as TransferType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="own">My Accounts</TabsTrigger>
                <TabsTrigger value="external">External</TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </>
      )}

      {/* Progress Indicator */}
      <div className="mb-8 flex gap-4">
        {(['select-from', 'recipient', 'amount', 'review', 'success'] as const).map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : ['recipient', 'amount', 'review'].includes(currentStep) &&
                    ['recipient', 'amount', 'review'].indexOf(step as any) <
                      ['recipient', 'amount', 'review'].indexOf(currentStep as any)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground/60'
              }`}
            >
              {idx + 1}
            </div>
            {idx < 4 && <div className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Recipient Step */}
        {currentStep === 'recipient' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Who are you sending to?
            </h2>
            <Tabs value={transferType} onValueChange={(v) => setTransferType(v as TransferType)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="own">My Accounts</TabsTrigger>
                <TabsTrigger value="external">External</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-4">
              {transferType === 'own' ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    To Account
                  </label>
                  <Select value={toAccountId} onValueChange={setToAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc.id !== fromAccountId).map((account) => (
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
              ) : (
                <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Account Number
                  </label>
                  <Input
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    placeholder="ACC1234567890"
                    maxLength={13}
                    autoFocus
                  />
                  
                  {/* Account Verification Feedback */}
                  {verifyingAccount && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span>Verifying account...</span>
                    </div>
                  )}
                  
                  {accountVerified && verifiedAccountName && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Account verified: <strong>{verifiedAccountName}</strong></span>
                    </div>
                  )}
                  
                  {accountVerificationError && recipientAccount.length === 13 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{accountVerificationError}</span>
                    </div>
                  )}
                  
                  {recipientAccount.length > 0 && recipientAccount.length < 13 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {13 - recipientAccount.length} characters remaining
                    </div>
                  )}
                </div>
                
                {/* Show Recipient Name field only after verification - READ ONLY */}
                {accountVerified && verifiedAccountName && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Recipient Name
                    </label>
                    <Input
                      value={verifiedAccountName}
                      readOnly
                      disabled
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="save-beneficiary"
                    checked={saveBeneficiary}
                    onChange={(e) => setSaveBeneficiary(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="save-beneficiary" className="text-sm text-foreground">
                    Save as beneficiary
                  </label>
                </div>
              </>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('select-from')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Amount Step */}
        {currentStep === 'amount' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              How much do you want to send?
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
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-2">
                  Available: ${fromAccount?.balance.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Note (Optional)
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What is this for?"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('recipient')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleNextStep} className="flex-1">
                  Review
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Review Step */}
        {currentStep === 'review' && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Review Transfer
            </h2>
            <div className="space-y-6">
              <div className="rounded-lg bg-secondary p-6">
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">From</p>
                    <p className="text-lg font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      Account: {fromAccount?.account_number}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-foreground/60 mb-1">To</p>
                    <p className="text-lg font-semibold text-foreground">
                      {transferType === 'own' ? (toAccount ? `${toAccount.account_type} Account` : '') : recipientName}
                    </p>
                    <p className="text-sm text-foreground/60">
                      Account: {transferType === 'own' ? toAccount?.account_number : recipientAccount}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-foreground/60 mb-1">Amount</p>
                    <p className="text-3xl font-bold text-primary">
                      ${parseFloat(amount).toFixed(2)}
                    </p>
                  </div>
                  {note && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-foreground/60 mb-1">Note</p>
                      <p className="text-foreground">{note}</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('amount')}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send Money'}
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
              Transfer Successful!
            </h2>
            <p className="text-foreground/60 mb-8">
              Your transfer has been completed
            </p>

            <div className="mb-8 rounded-lg bg-secondary p-6 text-left">
              <h3 className="text-lg font-semibold text-foreground mb-4 pb-3 border-b border-border">
                Transaction Receipt
              </h3>
              
              <div className="grid gap-4">
                {/* Date & Time */}
                <div className="flex justify-between">
                  <span className="text-foreground/60">Date & Time</span>
                  <span className="font-medium text-foreground">
                    {transferTimestamp ? transferTimestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : new Date().toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Sender Details */}
                <div className="pt-3 border-t border-border">
                  <div className="text-sm font-semibold text-foreground mb-2">From (Sender)</div>
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground/60 text-sm">Account</span>
                    <span className="font-medium text-foreground text-sm">
                      {fromAccount?.account_type?.display_name || 'Account'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60 text-sm">Account Number</span>
                    <span className="font-medium text-foreground text-sm">
                      {fromAccount?.account_number}
                    </span>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="pt-3 border-t border-border">
                  <div className="text-sm font-semibold text-foreground mb-2">To (Recipient)</div>
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground/60 text-sm">Name</span>
                    <span className="font-medium text-foreground text-sm">
                      {transferType === 'own' 
                        ? toAccount?.account_type?.display_name || 'My Account'
                        : recipientName || 'External Recipient'}
                    </span>
                  </div>
                  {transferType === 'external' && recipientAccount && (
                    <div className="flex justify-between">
                      <span className="text-foreground/60 text-sm">Account Number</span>
                      <span className="font-medium text-foreground text-sm">
                        {recipientAccount}
                      </span>
                    </div>
                  )}
                  {transferType === 'own' && toAccount && (
                    <div className="flex justify-between">
                      <span className="text-foreground/60 text-sm">Account Number</span>
                      <span className="font-medium text-foreground text-sm">
                        {toAccount.account_number}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount Breakdown */}
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/60">Transfer Amount</span>
                    <span className="font-medium text-foreground">
                      ${parseFloat(amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/60">Transaction Fee (0.5%)</span>
                    <span className="font-medium text-foreground">
                      ${(parseFloat(amount) * 0.005).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold text-foreground">Total Debited</span>
                    <span className="font-bold text-foreground text-lg">
                      ${(parseFloat(amount) * 1.005).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Description/Note */}
                {note && (
                  <div className="pt-3 border-t border-border">
                    <div className="text-sm font-semibold text-foreground mb-1">Description</div>
                    <p className="text-foreground/70 text-sm">{note}</p>
                  </div>
                )}

                {/* New Balance */}
                <div className="pt-3 border-t border-border bg-primary/5 -mx-6 px-6 py-3 rounded-b-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">New Balance</span>
                    <span className="font-bold text-foreground">
                      ${fromAccount ? (fromAccount.balance - parseFloat(amount) * 1.005).toFixed(2) : '0.00'}
                    </span>
                  </div>
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
                  setCurrentStep('select-from')
                  setRecipientName('')
                  setRecipientAccount('')
                  setToAccountId('')
                  setAmount('')
                  setNote('')
                  setTransferTimestamp(null)
                }}
                className="flex-1"
              >
                Send Again
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions - Moved to bottom */}
      <div className="mt-12 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent Transfers */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Recent Transfers
            </h3>
            {recentTransfers.length > 0 ? (
              <div className="space-y-2">
                {recentTransfers.slice(0, 3).map((transfer) => (
                  <button
                    key={transfer.id}
                    onClick={() => {
                      if (transfer.is_outgoing && transfer.recipient_name) {
                        setRecipientName(transfer.recipient_name)
                        setRecipientAccount(transfer.recipient_account || '')
                        setCurrentStep('amount')
                      }
                    }}
                    className="w-full text-left p-2 rounded hover:bg-secondary text-sm"
                  >
                    <div className="font-medium">{transfer.recipient_name}</div>
                    <div className="text-xs text-foreground/60">
                      {transfer.direction === 'sent' ? 'Sent' : 'Received'} ${Math.abs(transfer.amount).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/60">No recent transfers</p>
            )}
          </Card>

          {/* Saved Beneficiaries */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Saved Beneficiaries</h3>
            {beneficiaries.length > 0 ? (
              <div className="space-y-2">
                {beneficiaries.slice(0, 3).map((beneficiary) => (
                  <button
                    key={beneficiary.id}
                    onClick={() => {
                      setRecipientName(beneficiary.name)
                      setRecipientAccount(beneficiary.account_number)
                      setCurrentStep('amount')
                    }}
                    className="w-full text-left p-2 rounded hover:bg-secondary text-sm"
                  >
                    <div className="font-medium">{beneficiary.nickname || beneficiary.name}</div>
                    <div className="text-xs text-foreground/60">****{beneficiary.account_number.slice(-4)}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/60">No saved beneficiaries</p>
            )}
          </Card>

          {/* Quick Amounts */}
          <Card className="p-4">
            <h3 className="font-medium mb-3">Quick Amounts</h3>
            <div className="grid grid-cols-2 gap-2">
              {['50', '100', '250', '500'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className="p-2 rounded border hover:bg-secondary text-sm font-medium"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
