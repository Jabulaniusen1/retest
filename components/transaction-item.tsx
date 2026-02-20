'use client'

import { Transaction } from '@/types'
import {
  Send,
  Download,
  Upload,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const getIcon = () => {
    switch (transaction.transaction_type) {
      case 'transfer':
        return <Send className="h-5 w-5" />
      case 'deposit':
        return <Download className="h-5 w-5" />
      case 'withdrawal':
        return <Upload className="h-5 w-5" />
      case 'payment':
        return <CreditCard className="h-5 w-5" />
      default:
        return <Send className="h-5 w-5" />
    }
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-primary" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getTypeLabel = () => {
    switch (transaction.transaction_type) {
      case 'transfer':
        return 'Transfer'
      case 'deposit':
        return 'Deposit'
      case 'withdrawal':
        return 'Withdrawal'
      case 'payment':
        return 'Payment'
      default:
        return transaction.transaction_type
    }
  }

  const isIncoming =
    transaction.transaction_type === 'deposit' ||
    (transaction.transaction_type === 'transfer' && transaction.recipient_name)

  const formattedDate = new Date(transaction.created_at).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  )

  const formattedTime = new Date(transaction.created_at).toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )

  return (
    <div className="p-3 md:p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm md:text-base text-foreground truncate">
                  {transaction.recipient_name || getTypeLabel()}
                </p>
                <span className="hidden sm:inline">{getStatusIcon()}</span>
              </div>
              <p className="text-xs md:text-sm text-foreground/60 truncate">
                {transaction.description}
              </p>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p
                className={`font-bold text-base md:text-lg ${
                  isIncoming ? 'text-primary' : 'text-foreground'
                }`}
              >
                {isIncoming ? '+' : '-'}{formatCurrency(transaction.amount, '')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="text-xs text-foreground/40">
              <span className="hidden sm:inline">{formattedDate} at {formattedTime}</span>
              <span className="sm:hidden">{formattedDate}</span>
            </p>
            <Badge
              variant={
                transaction.status === 'completed'
                  ? 'default'
                  : transaction.status === 'pending'
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-[10px] md:text-xs"
            >
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
