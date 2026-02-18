'use client'

import React, { createContext, useState, useEffect } from 'react'
import { User, AuthContextType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      accountNumber: supabaseUser.user_metadata?.accountNumber || `ACC${Math.random().toString().slice(2, 12)}`,
      createdAt: new Date(supabaseUser.created_at),
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            accountNumber: `ACC${Math.random().toString().slice(2, 12)}`,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        setUser(mapSupabaseUser(data.user))
        
        // Note: Default checking account is automatically created by database trigger
        // See: supabase/migrations/011_update_signup_trigger.sql
        
        // Send welcome email via API route
        try {
          await fetch('/api/email/welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: data.user.id,
              accountNumber: data.user.user_metadata?.accountNumber || 'ACC000000000'
            })
          })
        } catch (emailError) {
          console.warn('Failed to send welcome email:', emailError)
          // Don't fail the signup if email fails
        }
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
