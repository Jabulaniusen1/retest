'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Account } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, Check, Building2, CreditCard, Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AddMoneyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
        } finally {
          setLoading(false)
        }
      }
    }
    fetchAccounts()
  }, [user])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!user) return null
  if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId)

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-8 w-8 p-0"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )

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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add Money</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">View your account details to receive funds</p>
      </div>

      <div className="max-w-3xl">
        {/* Account Selector */}
        <Card className="p-4 md:p-6 mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Select Account
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
        </Card>

        {/* Account Details */}
        {selectedAccount && (
          <div className="space-y-4">
            {/* Account Details Card */}
            <Card className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Account Details
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedAccount.account_type?.display_name || 'Account'} Account
                </p>
              </div>

              <div className="space-y-6">
                {/* Account Number */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Account Number</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <span className="font-mono text-base md:text-lg font-semibold">
                      {selectedAccount.account_number}
                    </span>
                    <CopyButton text={selectedAccount.account_number} field="account" />
                  </div>
                </div>

                {/* Routing Number */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Routing Number (Domestic Transfers)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <span className="font-mono text-base md:text-lg font-semibold">
                      {selectedAccount.routing_number}
                    </span>
                    <CopyButton text={selectedAccount.routing_number} field="routing" />
                  </div>
                </div>

                {/* SWIFT Code */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>SWIFT Code (International Transfers)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <span className="font-mono text-base md:text-lg font-semibold">
                      {selectedAccount.swift_code}
                    </span>
                    <CopyButton text={selectedAccount.swift_code} field="swift" />
                  </div>
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Bank Name</div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <span className="font-semibold">Capital City Bank</span>
                    <CopyButton text="Capital City Bank" field="bank" />
                  </div>
                </div>

                {/* Account Holder */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Account Holder Name</div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                    <span className="font-semibold">{user.name}</span>
                    <CopyButton text={user.name} field="name" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Additional Info */}
            <Card className="p-4 md:p-6 bg-muted/50">
              <h3 className="font-semibold text-foreground mb-3">Important Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Domestic transfers typically arrive within 1-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>International transfers may take 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Keep your account details secure and never share them publicly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Contact support if you notice any unauthorized transactions</span>
                </li>
              </ul>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
