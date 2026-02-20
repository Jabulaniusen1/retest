'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Icon } from '@/components/Icon'

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      label: 'Home',
      icon: 'home' as const,
      href: '/dashboard',
    },
    {
      label: 'Accounts',
      icon: 'wallet' as const,
      href: '/dashboard/accounts',
    },
    {
      label: 'Send',
      icon: 'send' as const,
      href: '/dashboard/send-money',
    },
    {
      label: 'History',
      icon: 'history' as const,
      href: '/dashboard/transactions',
    },
    {
      label: 'Settings',
      icon: 'settings' as const,
      href: '/dashboard/settings',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <nav className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map((item) => {
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
              <Icon name={item.icon} size={20} />
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
