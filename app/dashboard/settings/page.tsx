'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { createClient } from '@/lib/supabase/client'
import { Profile, VirtualCard } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Bell, Lock, Eye, Edit, Save, X, Upload, User, CreditCard, Snowflake, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(false)
  
  // Profile form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const prof = await apiClient.getProfile(user.id)
          setProfile(prof)
          setFullName(prof.full_name || '')
          setPhone(prof.phone || '')
          setAddress(prof.address || '')
          setCity(prof.city || '')
          setState(prof.state || '')
          setZipCode(prof.zip_code || '')
          // Format date for input field (YYYY-MM-DD)
          setDateOfBirth(prof.date_of_birth ? new Date(prof.date_of_birth).toISOString().split('T')[0] : '')
          setAvatarUrl(prof.avatar_url || '')
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchProfile()
    fetchVirtualCards()
  }, [user])

  const fetchVirtualCards = async () => {
    if (!user) return
    setCardsLoading(true)
    try {
      const cards = await apiClient.getVirtualCards(user.id)
      setVirtualCards(cards || [])
    } catch (error) {
      console.error('Error fetching virtual cards:', error)
    } finally {
      setCardsLoading(false)
    }
  }

  const handleFreezeCard = async (cardId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'frozen' : 'active'
      await apiClient.updateVirtualCardStatus(cardId, newStatus)
      toast({
        title: 'Success',
        description: `Card ${newStatus === 'frozen' ? 'frozen' : 'unfrozen'} successfully`
      })
      fetchVirtualCards()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update card status',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this virtual card? This action cannot be undone.')) {
      return
    }
    try {
      await apiClient.updateVirtualCardStatus(cardId, 'cancelled')
      toast({
        title: 'Success',
        description: 'Virtual card deleted successfully'
      })
      fetchVirtualCards()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete card',
        variant: 'destructive'
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaveLoading(true)
    try {
      // Format the date properly for database storage
      const formattedDateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : undefined
      
      await apiClient.updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zip_code: zipCode.trim() || undefined,
        date_of_birth: formattedDateOfBirth,
        avatar_url: avatarUrl || undefined
      })
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
      setEditingProfile(false)
      
      // Refresh profile data
      const updatedProfile = await apiClient.getProfile(user.id)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive'
      })
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      })
      return
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      })
      return
    }

    setSaveLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Password changed successfully'
      })
      setChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive'
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`
    
    setUploadingAvatar(true)
    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      await apiClient.updateProfile(user.id, { avatar_url: publicUrl })
      setAvatarUrl(publicUrl)
      
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully'
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive'
      })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return

    try {
      // Remove avatar file (using user_id/avatar.ext structure)
      const fileName = `${user.id}/avatar`
      
      // Remove from storage
      await supabase.storage
        .from('avatars')
        .remove([fileName])

      // Update profile
      await apiClient.updateProfile(user.id, { avatar_url: undefined })
      setAvatarUrl('')
      
      toast({
        title: 'Success',
        description: 'Profile picture removed successfully'
      })
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove profile picture',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </h2>
          {changingPassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                  >
                    {showCurrentPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                  >
                    {showNewPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={saveLoading}
                  className="flex-1"
                >
                  {saveLoading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setChangingPassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  disabled={saveLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setChangingPassword(true)}
              >
                Change Password
              </Button>
              <Button variant="outline" className="w-full" disabled>
                Enable Two-Factor Authentication
              </Button>
            </div>
          )}
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground">Transaction Alerts</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground">Email Notifications</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </div>
        </Card>

        {/* Virtual Cards Management */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Virtual Cards
          </h2>
          {cardsLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : virtualCards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">No virtual cards yet</p>
              <Button onClick={() => router.push('/dashboard/virtual-cards')}>
                Create Virtual Card
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {virtualCards.map((card) => (
                <div key={card.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{card.card_holder_name}</p>
                      <p className="text-sm text-muted-foreground">•••• •••• •••• {card.card_number.slice(-4)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      card.status === 'active' ? 'bg-green-100 text-green-700' :
                      card.status === 'frozen' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {card.status.toUpperCase()}
                    </div>
                  </div>
                  {card.status !== 'cancelled' && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleFreezeCard(card.id, card.status)}
                      >
                        <Snowflake className="h-4 w-4 mr-2" />
                        {card.status === 'active' ? 'Freeze' : 'Unfreeze'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/dashboard/virtual-cards')}
              >
                Manage All Virtual Cards
              </Button>
            </div>
          )}
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-foreground/60">
              Control how your information is used and shared
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/privacy')}
            >
              Privacy Policy
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/terms')}
            >
              Terms of Service
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
