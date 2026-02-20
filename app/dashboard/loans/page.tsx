'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Loan, LoanPayment } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Calendar, TrendingDown, Plus, CreditCard } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function LoansPage() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [loanType, setLoanType] = useState('personal')
  const [amount, setAmount] = useState('')
  const [termMonths, setTermMonths] = useState('12')

  useEffect(() => {
    fetchLoans()
  }, [user])

  const fetchLoans = async () => {
    if (!user) return
    try {
      const loansData = await apiClient.getLoans(user.id)
      setLoans(loansData)
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyForLoan = async () => {
    if (!user || !amount || !termMonths) return
    try {
      await apiClient.applyForLoan(user.id, loanType, parseFloat(amount), parseInt(termMonths))
      setAmount('')
      setApplyDialogOpen(false)
      fetchLoans()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getLoanTypeInfo = (type: string) => {
    const info: Record<string, { name: string; icon: string; color: string; rate: string }> = {
      personal: { name: 'Personal Loan', icon: '👤', color: 'bg-blue-500', rate: '8.5%' },
      auto: { name: 'Auto Loan', icon: '🚗', color: 'bg-green-500', rate: '5.5%' },
      home: { name: 'Home Loan', icon: '🏠', color: 'bg-purple-500', rate: '3.5%' },
      student: { name: 'Student Loan', icon: '🎓', color: 'bg-yellow-500', rate: '4.5%' },
      business: { name: 'Business Loan', icon: '💼', color: 'bg-red-500', rate: '7.0%' }
    }
    return info[type] || info.personal
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      approved: 'bg-blue-500/10 text-blue-500',
      active: 'bg-green-500/10 text-green-500',
      paid_off: 'bg-gray-500/10 text-gray-500',
      rejected: 'bg-red-500/10 text-red-500',
      defaulted: 'bg-red-500/10 text-red-500'
    }
    return colors[status] || colors.pending
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  const activeLoans = loans?.filter(l => l.status === 'active') || []
  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.outstanding_balance, 0)
  const totalMonthlyPayment = activeLoans.reduce((sum, loan) => sum + loan.monthly_payment, 0)

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Loans</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Manage your loan applications and payments</p>
        </div>
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Apply for Loan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for a Loan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Loan Type</label>
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Loan (8.5% APR)</SelectItem>
                    <SelectItem value="auto">Auto Loan (5.5% APR)</SelectItem>
                    <SelectItem value="home">Home Loan (3.5% APR)</SelectItem>
                    <SelectItem value="student">Student Loan (4.5% APR)</SelectItem>
                    <SelectItem value="business">Business Loan (7.0% APR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Loan Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Term (Months)</label>
                <Select value={termMonths} onValueChange={setTermMonths}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                    <SelectItem value="120">120 months (10 years)</SelectItem>
                    <SelectItem value="180">180 months (15 years)</SelectItem>
                    <SelectItem value="240">240 months (20 years)</SelectItem>
                    <SelectItem value="360">360 months (30 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleApplyForLoan} className="w-full">
                Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Outstanding</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Monthly Payment</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ${totalMonthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Active Loans</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {activeLoans.length}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {!loans || loans.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No loans yet</h3>
              <p className="text-muted-foreground mb-4">Apply for a loan to get started</p>
              <Button onClick={() => setApplyDialogOpen(true)}>Apply for Loan</Button>
            </div>
          </Card>
        ) : (
          loans?.map((loan) => {
            const typeInfo = getLoanTypeInfo(loan.loan_type)
            const progress = ((loan.amount - loan.outstanding_balance) / loan.amount) * 100

            return (
              <Card key={loan.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full ${typeInfo.color} flex items-center justify-center text-2xl`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{typeInfo.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Applied on {new Date(loan.application_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                    {loan.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
                    <div className="text-lg font-semibold text-foreground">
                      ${loan.amount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Outstanding</div>
                    <div className="text-lg font-semibold text-foreground">
                      ${loan.outstanding_balance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
                    <div className="text-lg font-semibold text-foreground">
                      ${loan.monthly_payment.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Interest Rate</div>
                    <div className="text-lg font-semibold text-foreground">
                      {loan.interest_rate}%
                    </div>
                  </div>
                </div>

                {loan.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Repayment Progress</span>
                      <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {loan.next_payment_date && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Payment Due</span>
                      <span className="text-sm font-medium text-foreground">
                        {new Date(loan.next_payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
