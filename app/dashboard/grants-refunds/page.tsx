'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Grant, TaxRefund, Account } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Gift, FileText, Plus, Calendar, DollarSign } from 'lucide-react'

export default function GrantsRefundsPage() {
  const { user } = useAuth()
  const [grants, setGrants] = useState<Grant[]>([])
  const [taxRefunds, setTaxRefunds] = useState<TaxRefund[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  
  const [grantType, setGrantType] = useState('education')
  const [grantTitle, setGrantTitle] = useState('')
  const [grantDescription, setGrantDescription] = useState('')
  const [grantAmount, setGrantAmount] = useState('')
  
  const [taxYear, setTaxYear] = useState(new Date().getFullYear() - 1)
  const [refundAmount, setRefundAmount] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const [grantsData, refundsData, accountsData] = await Promise.all([
        apiClient.getGrants(user.id),
        apiClient.getTaxRefunds(user.id),
        apiClient.getAccounts(user.id)
      ])
      setGrants(grantsData)
      setTaxRefunds(refundsData)
      setAccounts(accountsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyForGrant = async () => {
    if (!user || !grantTitle || !grantAmount) return
    try {
      await apiClient.applyForGrant(user.id, grantType, grantTitle, grantDescription, parseFloat(grantAmount))
      setGrantTitle('')
      setGrantDescription('')
      setGrantAmount('')
      setGrantDialogOpen(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleFileTaxRefund = async () => {
    if (!user || !refundAmount) return
    try {
      await apiClient.fileTaxRefund(user.id, taxYear, parseFloat(refundAmount), selectedAccountId || undefined)
      setRefundAmount('')
      setRefundDialogOpen(false)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getGrantTypeInfo = (type: string) => {
    const info: Record<string, { name: string; icon: string; color: string }> = {
      education: { name: 'Education Grant', icon: '🎓', color: 'bg-blue-500' },
      business: { name: 'Business Grant', icon: '💼', color: 'bg-green-500' },
      housing: { name: 'Housing Grant', icon: '🏠', color: 'bg-purple-500' },
      emergency: { name: 'Emergency Grant', icon: '🚨', color: 'bg-red-500' },
      research: { name: 'Research Grant', icon: '🔬', color: 'bg-yellow-500' }
    }
    return info[type] || info.education
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-blue-500/10 text-blue-500',
      disbursed: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
      processing: 'bg-blue-500/10 text-blue-500'
    }
    return colors[status] || colors.pending
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Grants & Tax Refunds</h1>
        <p className="text-muted-foreground mt-1">Apply for grants and track your tax refunds</p>
      </div>

      <Tabs defaultValue="grants" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="grants">Grants</TabsTrigger>
          <TabsTrigger value="refunds">Tax Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="grants" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Apply for Grant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for a Grant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Grant Type</label>
                    <Select value={grantType} onValueChange={setGrantType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education">Education Grant</SelectItem>
                        <SelectItem value="business">Business Grant</SelectItem>
                        <SelectItem value="housing">Housing Grant</SelectItem>
                        <SelectItem value="emergency">Emergency Grant</SelectItem>
                        <SelectItem value="research">Research Grant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Grant Title</label>
                    <Input
                      value={grantTitle}
                      onChange={(e) => setGrantTitle(e.target.value)}
                      placeholder="e.g., College Tuition Assistance"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      value={grantDescription}
                      onChange={(e) => setGrantDescription(e.target.value)}
                      placeholder="Describe your grant application..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount Requested</label>
                    <Input
                      type="number"
                      value={grantAmount}
                      onChange={(e) => setGrantAmount(e.target.value)}
                      placeholder="5000"
                    />
                  </div>
                  <Button onClick={handleApplyForGrant} className="w-full">
                    Submit Application
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {grants.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No grant applications yet</h3>
                <p className="text-muted-foreground mb-4">Apply for a grant to get financial assistance</p>
                <Button onClick={() => setGrantDialogOpen(true)}>Apply for Grant</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {grants?.map((grant) => {
                const typeInfo = getGrantTypeInfo(grant.grant_type)
                
                return (
                  <Card key={grant.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full ${typeInfo.color} flex items-center justify-center text-2xl`}>
                          {typeInfo.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{grant.title}</h3>
                          <p className="text-sm text-muted-foreground">{typeInfo.name}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(grant.status)}`}>
                        {grant.status.toUpperCase()}
                      </div>
                    </div>

                    {grant.description && (
                      <p className="text-muted-foreground mb-4">{grant.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Amount</div>
                        <div className="text-lg font-semibold text-foreground">
                          ${grant.amount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Applied</div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(grant.application_date).toLocaleDateString()}
                        </div>
                      </div>
                      {grant.approval_date && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Approved</div>
                          <div className="text-sm font-medium text-foreground">
                            {new Date(grant.approval_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {grant.disbursement_date && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Disbursed</div>
                          <div className="text-sm font-medium text-foreground">
                            {new Date(grant.disbursement_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  File Tax Refund
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>File Tax Refund</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tax Year</label>
                    <Select value={String(taxYear)} onValueChange={(v) => setTaxYear(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4].map((i) => {
                          const year = new Date().getFullYear() - i
                          return <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Refund Amount</label>
                    <Input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Deposit to Account (Optional)</label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_type?.display_name} - {account.account_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleFileTaxRefund} className="w-full">
                    Submit Refund Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {taxRefunds.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No tax refunds yet</h3>
                <p className="text-muted-foreground mb-4">File your tax refund to track the status</p>
                <Button onClick={() => setRefundDialogOpen(true)}>File Tax Refund</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {taxRefunds?.map((refund) => (
                <Card key={refund.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-2xl">
                        💰
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Tax Year {refund.tax_year}</h3>
                        <p className="text-sm text-muted-foreground">Federal Tax Refund</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(refund.status)}`}>
                      {refund.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Refund Amount</div>
                      <div className="text-lg font-semibold text-foreground">
                        ${refund.refund_amount.toLocaleString()}
                      </div>
                    </div>
                    {refund.filing_date && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Filed</div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(refund.filing_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {refund.expected_date && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Expected</div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(refund.expected_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {refund.disbursement_date && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Disbursed</div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date(refund.disbursement_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
