'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Bell, Lock, Eye, Edit, Save, X, Upload, User } from 'lucide-react'
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
  }, [user])

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
        {/* Account Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Account Information
            </h2>
            {!editingProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProfile(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
          
          {/* Profile Picture Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                    <User className="h-10 w-10 text-primary/40" />
                  </div>
                )}
                {editingProfile && (
                  <div className="absolute -bottom-1 -right-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </label>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground/60">
                  {editingProfile ? 'Click the camera icon to upload a new profile picture' : 'Profile picture'}
                </p>
                {editingProfile && avatarUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="mt-2"
                  >
                    Remove Picture
                  </Button>
                )}
              </div>
            </div>
          </div>
          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email (cannot be changed)
                </label>
                <Input value={user?.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="NY"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code
                </label>
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saveLoading}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProfile(false)
                    setFullName(profile?.full_name || '')
                    setPhone(profile?.phone || '')
                    setAddress(profile?.address || '')
                    setCity(profile?.city || '')
                    setState(profile?.state || '')
                    setZipCode(profile?.zip_code || '')
                  }}
                  disabled={saveLoading}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground/60">Full Name</label>
                <p className="text-lg font-semibold text-foreground">{fullName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-foreground/60">Email</label>
                <p className="text-lg font-semibold text-foreground">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-foreground/60">Phone</label>
                <p className="text-lg font-semibold text-foreground">{phone || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm text-foreground/60">Date of Birth</label>
                <p className="text-lg font-semibold text-foreground">
                  {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm text-foreground/60">Address</label>
                <p className="text-lg font-semibold text-foreground">
                  {address ? `${address}, ${city}, ${state} ${zipCode}` : 'Not set'}
                </p>
              </div>
            </div>
          )}
        </Card>

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
            <Button variant="outline" className="w-full">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full">
              Terms of Service
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
