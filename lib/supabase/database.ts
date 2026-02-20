import { createClient } from './client'
import type { Account, Transaction, AccountType, KYCVerification } from '../../types'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  account_id: string
  card_number: string
  card_type: 'debit' | 'credit'
  expiry_date: string
  cvv: string
  status: 'active' | 'locked' | 'cancelled'
  daily_limit: number
  created_at: string
  updated_at: string
}

export interface Beneficiary {
  id: string
  user_id: string
  name: string
  account_number: string
  bank_name?: string
  nickname?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'transaction' | 'security' | 'account' | 'general'
  read: boolean
  created_at: string
}

// Profile functions
export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // If profile doesn't exist, create a default one
    if (error.code === 'PGRST116') {
      console.log('Profile not found, creating default profile for user:', userId)
      
      // Get user info from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: user.user_metadata?.full_name || '',
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }
        
        return newProfile as Profile
      }
    }
    throw error
  }
  
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

// Account functions
export async function getAccountTypes() {
  const supabase = createClient()
  
  // Try new schema first (account_types table)
  try {
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .eq('is_active', true)
      .order('display_name')

    if (error) throw error
    return data as AccountType[]
  } catch (error) {
    // Fallback to default account types (when table doesn't exist)
    console.warn('Account types table not available, using default account types:', error)
    
    const defaultAccountTypes: AccountType[] = [
      {
        id: 'checking',
        name: 'checking',
        display_name: 'Checking Account',
        description: 'Standard checking account for daily transactions',
        min_balance: 0,
        max_balance: undefined,
        interest_rate: 0.0001,
        requires_kyc: false,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'savings',
        name: 'savings',
        display_name: 'Savings Account',
        description: 'High-yield savings account with better interest rates',
        min_balance: 100,
        max_balance: undefined,
        interest_rate: 0.0200,
        requires_kyc: false,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'credit',
        name: 'credit',
        display_name: 'Credit Account',
        description: 'Credit line with flexible spending',
        min_balance: 0,
        max_balance: undefined,
        interest_rate: 0.1899,
        requires_kyc: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
    
    return defaultAccountTypes
  }
}

export async function getAccounts(userId: string) {
  const supabase = createClient()
  
  // Try new schema first (with account_types relationship)
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        account_type:account_types(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Account[]
  } catch (error) {
    // Fallback to old schema (with account_type text field)
    console.warn('New schema not available, falling back to old schema:', error)
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Transform old schema data to match new interface
      return (data as any[]).map(account => ({
        ...account,
        account_type_id: null,
        account_type: {
          id: 'temp',
          name: account.account_type || 'checking',
          display_name: account.account_type ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1) : 'Checking',
          description: 'Legacy account type',
          min_balance: 0,
          max_balance: null,
          interest_rate: 0,
          requires_kyc: false,
          is_active: true,
          created_at: account.created_at
        }
      }))
    } catch (fallbackError) {
      console.error('Both schemas failed:', fallbackError)
      throw fallbackError
    }
  }
}

export async function getAccountById(accountId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (error) throw error
  return data as Account
}

export async function createAccount(
  userId: string,
  accountTypeId: string,
  nickname?: string
) {
  const supabase = createClient()
  
  console.log('Creating account with:', { userId, accountTypeId, nickname })
  
  try {
    // Generate account number, routing number, and SWIFT code
    const accountNumber = `ACC${Date.now()}${Math.random().toString().slice(2, 6)}`
    
    // Generate routing number (9 digits)
    const routingNumber = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
    
    // Generate SWIFT code (CCBKUS33XXX format)
    const swiftCode = `CCBKUS33${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    
    console.log('Generated account details:', { accountNumber, routingNumber, swiftCode })
    
    // Try new schema first (with account_types table)
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        account_number: accountNumber,
        account_type_id: accountTypeId,
        balance: 0,
        nickname: nickname,
        routing_number: routingNumber,
        swift_code: swiftCode
      })
      .select(`
        *,
        account_type:account_types(*)
      `)
      .single()

    console.log('New schema insert result:', { data, error })

    if (error) {
      console.error('Account creation failed:', error)
      throw error
    }
    return data as Account
  } catch (error) {
    console.error('Failed to create account:', error)
    throw error
  }
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId)
    .select()
    .single()

  if (error) throw error
  return data as Account
}

export async function updateAccountNickname(accountId: string, nickname: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accounts')
    .update({ nickname })
    .eq('id', accountId)
    .select()
    .single()

  if (error) throw error
  return data as Account
}

// Card functions
export async function getCardsByAccountId(accountId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('account_id', accountId)

  if (error) throw error
  return data as Card[]
}

export async function getCardsByUserId(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      account:accounts(*)
    `)
    .eq('account.user_id', userId)

  if (error) throw error
  return data as Card[]
}

export async function updateCardStatus(cardId: string, status: 'active' | 'locked' | 'cancelled') {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cards')
    .update({ status })
    .eq('id', cardId)
    .select()
    .single()

  if (error) throw error
  return data as Card
}

// Transaction functions
export async function getTransactions(userId: string, limit?: number) {
  const supabase = createClient()
  
  // First get user's accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
  
  if (accountsError) throw accountsError
  
  const accountIds = accounts.map(acc => acc.id)
  
  if (accountIds.length === 0) {
    return []
  }
  
  // Try new schema first (with account_types relationship)
  try {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        from_account:accounts!transactions_from_account_id_fkey(account_number, account_type:account_types(display_name)),
        to_account:accounts!transactions_to_account_id_fkey(account_number, account_type:account_types(display_name))
      `)
      .or(`from_account_id.in.(${accountIds.join(',')}),to_account_id.in.(${accountIds.join(',')})`)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Transaction[]
  } catch (error) {
    // Fallback to old schema (with account_type text field)
    console.warn('New schema not available, falling back to old schema for transactions:', error)
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          from_account:accounts!transactions_from_account_id_fkey(account_number, account_type),
          to_account:accounts!transactions_to_account_id_fkey(account_number, account_type)
        `)
        .or(`from_account_id.in.(${accountIds.join(',')}),to_account_id.in.(${accountIds.join(',')})`)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Transaction[]
    } catch (fallbackError) {
      console.error('Both schemas failed for transactions:', fallbackError)
      throw fallbackError
    }
  }
}

export async function getTransactionsByAccountId(accountId: string, limit?: number) {
  const supabase = createClient()
  let query = supabase
    .from('transactions')
    .select('*')
    .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Transaction[]
}

export async function createTransaction(transaction: {
  from_account_id: string
  to_account_id?: string
  transaction_type: 'transfer' | 'deposit' | 'withdrawal' | 'payment'
  amount: number
  description?: string
  recipient_name?: string
  category?: string
}) {
  const supabase = createClient()
  
  // Generate reference number
  const { data: refNumber } = await supabase.rpc('generate_reference_number')
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      reference_number: refNumber,
      status: 'completed'
    })
    .select(`
      *,
      from_account:accounts!transactions_from_account_id_fkey(user_id, account_number),
      to_account:accounts!transactions_to_account_id_fkey(user_id, account_number)
    `)
    .single()

  if (error) throw error

  // Send email notification for the transaction
  try {
    // Send transaction notification via API route
    const transactionData = data as any
    
    // Send notification to the from_account user
    if (transactionData.from_account?.user_id) {
      await fetch('/api/email/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: transactionData.from_account.user_id,
          transactionType: transaction.transaction_type === 'withdrawal' ? 'payment' : transaction.transaction_type,
          amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount),
          recipientName: transaction.recipient_name,
          accountNumber: transactionData.from_account.account_number,
          transactionDate: new Date().toLocaleDateString(),
          referenceNumber: refNumber || 'N/A'
        })
      })
    }

    // Send notification to the to_account user (for transfers)
    if (transaction.transaction_type === 'transfer' && transactionData.to_account?.user_id) {
      await fetch('/api/email/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: transactionData.to_account.user_id,
          transactionType: 'deposit',
          amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount),
          recipientName: 'Transfer Received',
          accountNumber: transactionData.to_account.account_number,
          transactionDate: new Date().toLocaleDateString(),
          referenceNumber: refNumber || 'N/A'
        })
      })
    }
  } catch (emailError) {
    console.warn('Failed to send transaction email notification:', emailError)
    // Don't throw the error - the transaction was successful, just the email failed
  }

  return data as Transaction
}

export async function searchTransactions(
  userId: string,
  filters: {
    type?: string
    startDate?: string
    endDate?: string
    minAmount?: number
    maxAmount?: number
    searchTerm?: string
  }
) {
  const supabase = createClient()
  
  // First get user's account IDs
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
  
  if (accountsError) throw accountsError
  
  const accountIds = accounts.map(acc => acc.id)
  
  if (accountIds.length === 0) {
    return []
  }
  
  let query = supabase
    .from('transactions')
    .select(`
      *,
      from_account:accounts!transactions_from_account_id_fkey(account_number, account_type:account_types(display_name)),
      to_account:accounts!transactions_to_account_id_fkey(account_number, account_type:account_types(display_name))
    `)
    .or(`from_account_id.in.(${accountIds.join(',')}),to_account_id.in.(${accountIds.join(',')})`)

  if (filters.type) {
    query = query.eq('transaction_type', filters.type)
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  if (filters.minAmount) {
    query = query.gte('amount', filters.minAmount)
  }

  if (filters.maxAmount) {
    query = query.lte('amount', filters.maxAmount)
  }

  if (filters.searchTerm) {
    query = query.or(`description.ilike.%${filters.searchTerm}%,recipient_name.ilike.%${filters.searchTerm}%,reference_number.ilike.%${filters.searchTerm}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data as Transaction[]
}

// Notification functions
export async function getNotifications(userId: string, unreadOnly = false) {
  const supabase = createClient()
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

export async function createNotification(notification: {
  user_id: string
  title: string
  message: string
  type: 'transaction' | 'security' | 'account' | 'general'
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

// Beneficiary and recent transfer functions
export async function getBeneficiaries(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createBeneficiary(beneficiary: {
  user_id: string
  name: string
  account_number: string
  nickname?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(beneficiary)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getRecentTransfers(userId: string, limit = 5) {
  const supabase = createClient()
  
  // Get user's accounts first
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
  
  if (accountsError) throw accountsError
  
  const accountIds = accounts.map(acc => acc.id)
  
  if (accountIds.length === 0) return []
  
  // Get recent transactions from user's accounts
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      from_account:accounts!transactions_from_account_id_fkey(account_number, account_type),
      to_account:accounts!transactions_to_account_id_fkey(account_number, account_type)
    `)
    .or(`from_account_id.in.(${accountIds.join(',')}),to_account_id.in.(${accountIds.join(',')})`)
    .in('transaction_type', ['transfer', 'payment'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  
  // Process transactions to extract recipient info
  return data.map(transaction => {
    const isOutgoing = accountIds.includes(transaction.from_account_id)
    const otherAccount = isOutgoing ? transaction.to_account : transaction.from_account
    
    return {
      ...transaction,
      is_outgoing: isOutgoing,
      recipient_name: transaction.recipient_name || 
                     (otherAccount ? `Account ending in ${otherAccount.account_number?.slice(-4) || '****'}` : 'Unknown'),
      recipient_account: otherAccount?.account_number || null,
      direction: isOutgoing ? 'sent' : 'received'
    }
  })
}

export async function updateBeneficiary(beneficiaryId: string, updates: {
  name?: string
  nickname?: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('beneficiaries')
    .update(updates)
    .eq('id', beneficiaryId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBeneficiary(beneficiaryId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('beneficiaries')
    .delete()
    .eq('id', beneficiaryId)

  if (error) throw error
}
export async function getUserByEmail(email: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.admin.listUsers()
  
  if (error) throw error
  
  // Find user by email in the list
  const user = data.users.find(u => u.email === email)
  if (!user) {
    throw new Error('User not found')
  }
  
  return user
}

export async function findRecipientAccount(recipientInfo: string) {
  const supabase = createClient()
  
  try {
    let recipientAccount = null
    
    // Try to find by account number first
    if (recipientInfo.match(/ACC\d+/)) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('account_number', recipientInfo)
        .single()
      
      if (!accountError && account) {
        console.log('Found account by number:', account)
        
        // Fetch the user profile separately
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', account.user_id)
          .single()
        
        // Attach profile to account
        if (profile) {
          account.user = profile
        }
        
        return account
      } else {
        console.log('Account lookup error:', accountError)
      }
    }
    
    // Try to find by email
    if (recipientInfo.includes('@')) {
      try {
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
        if (!userError) {
          const user = users.find(u => u.email === recipientInfo)
          if (user) {
            const { data: accounts, error: accountsError } = await supabase
              .from('accounts')
              .select('*')
              .eq('user_id', user.id)
              .limit(1)
            
            if (!accountsError && accounts && accounts.length > 0) {
              console.log('Found account by email:', accounts[0])
              
              // Fetch the user profile separately
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', accounts[0].user_id)
                .single()
              
              // Attach profile to account
              if (profile) {
                accounts[0].user = profile
              }
              
              return accounts[0]
            }
          }
        }
      } catch (error) {
        console.warn('Could not find recipient by email:', error)
      }
    }
    
    // Try to find by account holder name
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', `%${recipientInfo}%`)
      .limit(1)
    
    if (!profilesError && profiles && profiles.length > 0) {
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', profiles[0].id)
        .limit(1)
      
      if (!accountsError && accounts && accounts.length > 0) {
        console.log('Found account by name:', accounts[0])
        accounts[0].user = profiles[0]
        return accounts[0]
      }
    }
    
    return null
  } catch (error) {
    console.error('Error finding recipient account:', error)
    return null
  }
}

// Transfer function with balance updates
export async function transferMoney(
  fromAccountId: string,
  toAccountId: string | undefined,
  amount: number,
  description?: string,
  recipientName?: string,
  recipientAccountNumber?: string
) {
  const supabase = createClient()

  // Get from account with user_id
  const { data: fromAccount, error: fromError } = await supabase
    .from('accounts')
    .select('balance, user_id, status')
    .eq('id', fromAccountId)
    .single()

  if (fromError) throw fromError
  
  // Check if account is already blocked
  if (fromAccount.status === 'frozen') {
    throw new Error('We have detected unusual activities on your account coming from multiple locations, contact support')
  }

  // Check sufficient balance
  if (fromAccount.balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Update from account balance (always deduct)
  const { error: updateFromError } = await supabase
    .from('accounts')
    .update({ balance: fromAccount.balance - amount })
    .eq('id', fromAccountId)

  if (updateFromError) throw updateFromError

  // Handle external transfers (no toAccountId)
  if (!toAccountId) {
    let recipientAccount = null
    
    console.log('External transfer - Looking for recipient:', { recipientAccountNumber, recipientName })
    
    // Try to find recipient by account number first (most precise)
    if (recipientAccountNumber) {
      try {
        recipientAccount = await findRecipientAccount(recipientAccountNumber)
        console.log('Found recipient by account number:', recipientAccount?.id)
      } catch (error) {
        console.warn('Could not find recipient by account number:', error)
      }
    }
    
    // If not found by account number, try by name
    if (!recipientAccount && recipientName) {
      try {
        recipientAccount = await findRecipientAccount(recipientName)
        console.log('Found recipient by name:', recipientAccount?.id)
      } catch (error) {
        console.warn('Could not find recipient by name:', error)
      }
    }
    
    if (recipientAccount) {
      console.log('Crediting recipient account:', {
        accountId: recipientAccount.id,
        currentBalance: recipientAccount.balance,
        amountToAdd: amount,
        newBalance: recipientAccount.balance + amount
      })
      
      // Found recipient account, credit it
      const { error: updateRecipientError } = await supabase
        .from('accounts')
        .update({ balance: recipientAccount.balance + amount })
        .eq('id', recipientAccount.id)

      if (updateRecipientError) {
        console.error('Error updating recipient balance:', updateRecipientError)
        throw updateRecipientError
      }

      console.log('Successfully credited recipient account')

      // Create transaction for user-to-user transfer
      const transaction = await createTransaction({
        from_account_id: fromAccountId,
        to_account_id: recipientAccount.id,
        transaction_type: 'transfer',
        amount,
        description: description || `Transfer to ${recipientName}`,
        recipient_name: recipientAccount.user?.full_name || recipientName
      })

      // Check transaction count and block account after 2 successful transfers
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('from_account_id', fromAccountId)
        .in('transaction_type', ['transfer', 'payment'])

      if (count && count >= 2) {
        // Block all user accounts after 2 transactions
        await supabase
          .from('accounts')
          .update({ status: 'frozen' })
          .eq('user_id', fromAccount.user_id)
        
        // Send email notification
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', fromAccount.user_id)
            .single()
          
          if (userProfile?.email) {
            const { sendAccountBlockedEmail } = await import('../email')
            await sendAccountBlockedEmail(userProfile.email, userProfile.full_name || 'Valued Customer')
          }
        } catch (emailError) {
          console.error('Failed to send account blocked email:', emailError)
          // Don't throw - account is already blocked
        }
      }

      return transaction
    } else {
      console.log('No recipient found - creating external payment transaction')
      // No recipient found, create payment transaction (external)
      const transaction = await createTransaction({
        from_account_id: fromAccountId,
        to_account_id: undefined,
        transaction_type: 'payment',
        amount,
        description: description || `Payment to ${recipientName || 'External Recipient'}`,
        recipient_name: recipientName
      })

      // Check transaction count and block account after 2 successful transfers
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('from_account_id', fromAccountId)
        .in('transaction_type', ['transfer', 'payment'])

      if (count && count >= 2) {
        // Block all user accounts after 2 transactions
        await supabase
          .from('accounts')
          .update({ status: 'frozen' })
          .eq('user_id', fromAccount.user_id)
        
        // Send email notification
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', fromAccount.user_id)
            .single()
          
          if (userProfile?.email) {
            const { sendAccountBlockedEmail } = await import('../email')
            await sendAccountBlockedEmail(userProfile.email, userProfile.full_name || 'Valued Customer')
          }
        } catch (emailError) {
          console.error('Failed to send account blocked email:', emailError)
          // Don't throw - account is already blocked
        }
      }

      return transaction
    }
  }

  // Handle internal transfers (with toAccountId)
  const { data: toAccount, error: toError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', toAccountId)
    .single()

  if (toError) throw toError

  // Update to account balance
  const { error: updateToError } = await supabase
    .from('accounts')
    .update({ balance: toAccount.balance + amount })
    .eq('id', toAccountId)

  if (updateToError) throw updateToError

  // Create transaction for internal transfer
  const transaction = await createTransaction({
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    transaction_type: 'transfer',
    amount,
    description: description || 'Transfer between accounts'
  })

  // Check transaction count and block account after 2 successful transfers
  const { count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('from_account_id', fromAccountId)
    .in('transaction_type', ['transfer', 'payment'])

  if (count && count >= 2) {
    // Block all user accounts after 2 transactions
    await supabase
      .from('accounts')
      .update({ status: 'frozen' })
      .eq('user_id', fromAccount.user_id)
    
    // Send email notification via API route
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', fromAccount.user_id)
        .single()
      
      if (userProfile?.email) {
        await fetch('/api/send-blocked-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userProfile.email,
            name: userProfile.full_name || 'Valued Customer'
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send account blocked email:', emailError)
      // Don't throw - account is already blocked
    }
  }

  return transaction
}
export async function depositMoney(accountId: string, amount: number, description?: string) {
  const supabase = createClient()

  // Get account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single()

  if (accountError) throw accountError

  // Update balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: account.balance + amount })
    .eq('id', accountId)

  if (updateError) throw updateError

  // Create transaction
  const transaction = await createTransaction({
    from_account_id: accountId,
    transaction_type: 'deposit',
    amount,
    description: description || 'Deposit'
  })

  return transaction
}

// KYC Verification functions
export async function getKYCVerifications(userId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.warn('KYC verifications table may not exist:', error)
      return []
    }
    return data as KYCVerification[]
  } catch (error) {
    console.warn('Error fetching KYC verifications:', error)
    return []
  }
}

export async function getKYCVerification(userId: string, verificationType: 'identity' | 'address' | 'income' | 'business') {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('verification_type', verificationType)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as KYCVerification | null
}

export async function createKYCVerification(kycData: {
  user_id: string
  verification_type: 'identity' | 'address' | 'income' | 'business'
  identity_document_url?: string
  address_document_url?: string
  income_document_url?: string
  business_document_url?: string
  full_name?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  phone?: string
}) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert(kycData)
      .select()
      .single()

    if (error) {
      console.error('KYC verification table error:', error)
      throw new Error('KYC verification feature is not available. Please contact support.')
    }
    return data as KYCVerification
  } catch (error) {
    console.error('Error creating KYC verification:', error)
    throw new Error('Unable to submit KYC verification. The feature may not be available yet.')
  }
}

export async function updateKYCVerification(
  verificationId: string,
  updates: Partial<KYCVerification>
) {
  const supabase = createClient()
  
  // Get current verification data before updating
  const { data: currentData, error: fetchError } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('id', verificationId)
    .single()

  if (fetchError) throw fetchError

  const { data, error } = await supabase
    .from('kyc_verifications')
    .update(updates)
    .eq('id', verificationId)
    .select()
    .single()

  if (error) throw error

  // Send email notification if status changed
  try {
    const updatedData = data as KYCVerification
    const currentVerification = currentData as KYCVerification

    // Check if status was updated and it's different from before
    if (updates.status && updates.status !== currentVerification.status) {
      const verificationTypeLabels = {
        identity: 'Identity Verification',
        address: 'Address Verification', 
        income: 'Income Verification',
        business: 'Business Verification'
      }

      await fetch('/api/email/kyc-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: updatedData.user_id,
          verificationType: verificationTypeLabels[updatedData.verification_type],
          status: updates.status,
          rejectionReason: updatedData.rejection_reason,
          nextSteps: updates.status === 'rejected' 
            ? 'Please review the rejection reason and submit your verification again with corrected information.'
            : undefined
        })
      })
    }
  } catch (emailError) {
    console.warn('Failed to send KYC status email notification:', emailError)
    // Don't throw the error - the update was successful, just the email failed
  }

  return data as KYCVerification
}

export async function uploadKYCDocument(userId: string, file: File, documentType: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`
  
  const { error: uploadError } = await supabase.storage
    .from('kyc-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('kyc-documents')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function checkUserKYCStatus(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}
