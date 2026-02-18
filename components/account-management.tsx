'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Plus, DollarSign, TrendingUp, CreditCard, Building, PiggyBank } from 'lucide-react'
import type { Account, AccountType } from '@/types'

export function AccountManagement() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedAccountType, setSelectedAccountType] = useState('')
  const [accountNickname, setAccountNickname] = useState('')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    try {
      const [accountsData, accountTypesData] = await Promise.all([
        apiClient.getAccounts(user.id),
        apiClient.getAccountTypes()
      ])
      setAccounts(accountsData || [])
      setAccountTypes(accountTypesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load account data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!user || !selectedAccountType) return

    setCreateLoading(true)
    try {
      await apiClient.createAccount(user.id, selectedAccountType, accountNickname || '')
      
      toast({
        title: 'Success',
        description: 'Account created successfully'
      })
      
      setCreateDialogOpen(false)
      setSelectedAccountType('')
      setAccountNickname('')
      loadData()
    } catch (error) {
      console.error('Error creating account:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive'
      })
    } finally {
      setCreateLoading(false)
    }
  }

  const getAccountIcon = (accountTypeName: string) => {
    switch (accountTypeName) {
      case 'checking':
        return <DollarSign className="h-5 w-5" />
      case 'savings':
        return <PiggyBank className="h-5 w-5" />
      case 'credit':
        return <CreditCard className="h-5 w-5" />
      case 'investment':
        return <TrendingUp className="h-5 w-5" />
      case 'business':
        return <Building className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance)
  }

  const formatInterestRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}% APY`
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading accounts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Accounts</h2>
          <p className="text-gray-600">Manage your bank accounts</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Choose an account type to open a new account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account-type">Account Type</Label>
                <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          {getAccountIcon(type.name)}
                          <div>
                            <div className="font-medium">{type.display_name}</div>
                            <div className="text-sm text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAccountType && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const selectedType = accountTypes.find(t => t.id === selectedAccountType)
                    if (!selectedType) return null
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getAccountIcon(selectedType.name)}
                          <h4 className="font-medium">{selectedType.display_name}</h4>
                          {selectedType.requires_kyc && (
                            <Badge variant="secondary">KYC Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{selectedType.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Min Balance:</span> {formatBalance(selectedType.min_balance)}
                          </div>
                          <div>
                            <span className="font-medium">Interest Rate:</span> {formatInterestRate(selectedType.interest_rate)}
                          </div>
                          {selectedType.max_balance && (
                            <div>
                              <span className="font-medium">Max Balance:</span> {formatBalance(selectedType.max_balance)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nickname">Account Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  placeholder="My Savings Account"
                  value={accountNickname}
                  onChange={(e) => setAccountNickname(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleCreateAccount} 
                disabled={!selectedAccountType || createLoading}
                className="w-full"
              >
                {createLoading ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Accounts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8 text-foreground/60">
            Loading accounts...
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <div className="col-span-full text-center py-8 text-foreground/60">
            No accounts yet. Create your first account above.
          </div>
        ) : (
          accounts.map(account => (
          <Card key={account.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {account.account_type && getAccountIcon(account.account_type.name)}
                  <CardTitle className="text-lg">
                    {account.nickname || account.account_type?.display_name}
                  </CardTitle>
                </div>
                <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                  {account.status}
                </Badge>
              </div>
              <CardDescription>
                {account.account_number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatBalance(account.balance)}
                </div>
                {account.account_type && (
                  <div className="text-sm text-gray-500">
                    {formatInterestRate(account.account_type.interest_rate)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  )
}
