'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bell, Check, Trash2, Mail, Shield, Wallet, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'transaction' | 'security' | 'account' | 'general'
  read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user, filter])

  const fetchNotifications = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await apiClient.getNotifications(user.id, filter === 'unread')
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      await Promise.all(unreadIds.map(id => apiClient.markNotificationAsRead(id)))
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <Wallet className="h-5 w-5 text-blue-500" />
      case 'security':
        return <Shield className="h-5 w-5 text-red-500" />
      case 'account':
        return <Mail className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading notifications...</p>
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 md:h-8 md:w-8" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'unread' 
              ? "You're all caught up!" 
              : "We'll notify you when something important happens"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all hover:shadow-md ${
                !notification.read ? 'bg-primary/5 border-primary/20' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`font-semibold text-sm ${
                      !notification.read ? 'text-foreground' : 'text-foreground/80'
                    }`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(notification.created_at)}
                    </span>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-7 text-xs"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
