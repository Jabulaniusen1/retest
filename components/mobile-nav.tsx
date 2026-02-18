'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Wallet, Send, History, Settings } from 'lucide-react'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
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
      label: 'Send',
      icon: Send,
      href: '/dashboard/send-money',
    },
    {
      label: 'History',
      icon: History,
      href: '/dashboard/transactions',
    },
    // {
    //   label: 'Cards',
    //   icon: CreditCard,
    //   href: '/dashboard/cards',
    // },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <nav className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
