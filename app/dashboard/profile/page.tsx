'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Upload, Camera, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Profile {
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

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await apiClient.getProfile(user.id)
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip_code: data.zip_code || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      await apiClient.updateProfile(user.id, formData)
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || ''
      })
    }
    setEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`
    
    setUploadingAvatar(true)
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await apiClient.updateProfile(user.id, { avatar_url: publicUrl })
      
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully'
      })
      
      fetchProfile()
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
    if (!user || !profile?.avatar_url) return

    try {
      const fileName = `${user.id}/avatar`
      
      await supabase.storage
        .from('avatars')
        .remove([fileName])

      await apiClient.updateProfile(user.id, { avatar_url: undefined })
      
      toast({
        title: 'Success',
        description: 'Profile picture removed successfully'
      })
      
      fetchProfile()
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
          <p className="text-foreground/60">Loading profile...</p>
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 md:h-8 md:w-8" />
          Profile
        </h1>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <User className="h-16 w-16 text-primary/40" />
                </div>
              )}
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-semibold text-foreground mb-1">{profile?.full_name || 'User'}</h3>
              <p className="text-sm text-muted-foreground mb-4">{profile?.email}</p>
              
              {editing && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  {profile?.avatar_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              {editing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-foreground/80 py-2">{profile?.full_name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <p className="text-foreground/80 py-2">{profile?.email}</p>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              {editing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                />
              ) : (
                <p className="text-foreground/80 py-2">{profile?.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date of Birth
              </label>
              {editing ? (
                <Input
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  type="date"
                />
              ) : (
                <p className="text-foreground/80 py-2">
                  {profile?.date_of_birth 
                    ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Street Address
              </label>
              {editing ? (
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              ) : (
                <p className="text-foreground/80 py-2">{profile?.address || 'Not provided'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                {editing ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />
                ) : (
                  <p className="text-foreground/80 py-2">{profile?.city || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State
                </label>
                {editing ? (
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                    maxLength={2}
                  />
                ) : (
                  <p className="text-foreground/80 py-2">{profile?.state || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code
                </label>
                {editing ? (
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="10001"
                    maxLength={10}
                  />
                ) : (
                  <p className="text-foreground/80 py-2">{profile?.zip_code || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
