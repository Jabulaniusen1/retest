'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, Download, Calendar, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Account {
  id: string
  account_number: string
  balance: number
  account_type: {
    display_name: string
  }
}

export default function StatementsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  const fetchAccounts = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await apiClient.getAccounts(user.id)
      setAccounts(data)
      if (data.length > 0) {
        setSelectedAccount(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadStatement = async () => {
    if (!selectedAccount || !selectedMonth) {
      toast({
        title: 'Error',
        description: 'Please select an account and month',
        variant: 'destructive'
      })
      return
    }

    try {
      setDownloading(true)
      
      const account = accounts.find(a => a.id === selectedAccount)
      const monthName = months.find(m => m.value === selectedMonth)?.label
      
      // Simulate statement generation
      toast({
        title: 'Generating Statement',
        description: `Preparing ${monthName} ${selectedYear} statement for ${account?.account_type.display_name}...`
      })

      // In a real app, this would call an API to generate and download the PDF
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: 'Statement Ready',
        description: 'Your statement has been generated successfully',
      })

      // Simulate download
      const filename = `statement_${account?.account_number}_${selectedYear}_${selectedMonth}.pdf`
      console.log('Downloading:', filename)
      
    } catch (error) {
      console.error('Error downloading statement:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate statement',
        variant: 'destructive'
      })
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadYearEnd = async () => {
    if (!selectedAccount) {
      toast({
        title: 'Error',
        description: 'Please select an account',
        variant: 'destructive'
      })
      return
    }

    try {
      setDownloading(true)
      
      const account = accounts.find(a => a.id === selectedAccount)
      
      toast({
        title: 'Generating Year-End Statement',
        description: `Preparing ${selectedYear} year-end statement for ${account?.account_type.display_name}...`
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: 'Statement Ready',
        description: 'Your year-end statement has been generated successfully',
      })

      const filename = `year_end_statement_${account?.account_number}_${selectedYear}.pdf`
      console.log('Downloading:', filename)
      
    } catch (error) {
      console.error('Error downloading year-end statement:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate year-end statement',
        variant: 'destructive'
      })
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 md:h-8 md:w-8" />
          Account Statements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download your monthly and year-end account statements
        </p>
      </div>

      {accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Accounts Found</h3>
          <p className="text-muted-foreground mb-4">
            You need to have an account to download statements
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Monthly Statement */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Monthly Statement</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Download statements for a specific month
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Account
                </label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type.display_name} - {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Month
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleDownloadStatement} 
              disabled={downloading || !selectedMonth}
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Generating...' : 'Download Monthly Statement'}
            </Button>
          </Card>

          {/* Year-End Statement */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Year-End Statement</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Download a comprehensive statement for the entire year
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Account
                </label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_type.display_name} - {account.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleDownloadYearEnd} 
              disabled={downloading}
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              {downloading ? 'Generating...' : 'Download Year-End Statement'}
            </Button>
          </Card>

          {/* Information */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground mb-2">Important Information</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Statements are available for the past 5 years</li>
              <li>• Monthly statements are generated on the 1st of each month</li>
              <li>• Year-end statements include tax information</li>
              <li>• All statements are in PDF format</li>
              <li>• Keep your statements for tax and record-keeping purposes</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}
