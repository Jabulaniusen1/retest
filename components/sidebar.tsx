'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Profile } from '@/types'
import {
  Home,
  Send,
  History,
  Settings,
  LogOut,
  CreditCard,
  Wallet,
  Shield,
  Bitcoin,
  TrendingUp,
  Gift,
  Lightbulb,
} from 'lucide-react'

export function Sidebar() {
  const { logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const response = await fetch(`/api/profile/${user.id}`)
          const data = await response.json()
          setProfile(data.profile)
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      }
    }
    fetchProfile()
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const menuItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/dashboard',
    },
    {
      label: 'Accounts',
      icon: Wallet,
      href: '/dashboard/accounts',
    },
    {
      label: 'Transactions',
      icon: History,
      href: '/dashboard/transactions',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ]

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      {/* Logo */}
      <div className="border-b border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center">
            <div className="h-6 w-6 rounded bg-white"></div>
          </div>
          <span className="font-bold text-xl text-white">Capital Bank</span>
        </div>
      </div>

      {/* User Info */}
      <div className="border-b border-slate-700 p-6">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover border-2 border-slate-600 shadow-lg"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-blue-200">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? 'default' : 'ghost'}
              className={`w-full justify-start h-14 text-base font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => router.push(item.href)}
            >
              <Icon className="mr-4 h-6 w-6" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700 p-4">
        <Button
          variant="outline"
          className="w-full justify-start h-14 text-base font-medium text-slate-300 border-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="mr-4 h-6 w-6" />
          Logout
        </Button>
      </div>
    </div>
  )
}
