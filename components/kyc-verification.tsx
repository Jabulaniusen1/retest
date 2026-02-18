'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Upload, FileText, CheckCircle, Clock, XCircle } from 'lucide-react'

interface KYCVerificationProps {
  onVerificationComplete?: () => void
}

export function KYCVerification({ onVerificationComplete }: KYCVerificationProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [verificationType, setVerificationType] = useState<'identity' | 'address' | 'income' | 'business'>('identity')
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<{
    identity?: File
    address?: File
    income?: File
    business?: File
  }>({})
  const [existingVerification, setExistingVerification] = useState<any>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, documentType: 'identity' | 'address' | 'income' | 'business') => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 10MB',
          variant: 'destructive'
        })
        return
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Only images and PDF files are allowed',
          variant: 'destructive'
        })
        return
      }
      
      setUploadedFiles(prev => ({ ...prev, [documentType]: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Check if verification already exists
      const existing = await apiClient.getKYCVerification(user.id)
      if (existing) {
        toast({
          title: 'Info',
          description: `You already have a ${verificationType} verification submitted`
        })
        return
      }

      // Upload documents
      const documentUrls: any = {}
      for (const [docType, file] of Object.entries(uploadedFiles)) {
        if (file) {
          const url = await apiClient.uploadKYCDocument(user.id, docType, file)
          documentUrls[`${docType}_document_url`] = url
        }
      }

      // Create KYC verification
      await apiClient.createKYCVerification(
        user.id,
        verificationType,
        '',
        formData.full_name,
        formData.date_of_birth,
        formData.address
      )

      toast({
        title: 'Success',
        description: 'Your verification has been submitted for review'
      })

      // Reset form
      setFormData({
        full_name: '',
        date_of_birth: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'US',
        phone: ''
      })
      setUploadedFiles({})

      onVerificationComplete?.()
    } catch (error) {
      console.error('Error submitting KYC:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit verification',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const verificationTypes = [
    {
      value: 'identity',
      label: 'Identity Verification',
      description: 'Verify your identity with government-issued ID',
      requiredFields: ['full_name', 'date_of_birth'],
      documents: ['identity'] as const
    },
    {
      value: 'address',
      label: 'Address Verification',
      description: 'Verify your address with utility bills or bank statements',
      requiredFields: ['full_name', 'address', 'city', 'state', 'zip_code'],
      documents: ['address'] as const
    },
    {
      value: 'income',
      label: 'Income Verification',
      description: 'Verify your income for premium account features',
      requiredFields: ['full_name'],
      documents: ['income'] as const
    },
    {
      value: 'business',
      label: 'Business Verification',
      description: 'Verify your business for business account features',
      requiredFields: ['full_name', 'address'],
      documents: ['business'] as const
    }
  ]

  const currentVerificationType = verificationTypes.find(t => t.value === verificationType)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Complete your verification to access premium account features and higher limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Verification Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="verification-type">Verification Type</Label>
              <Select value={verificationType} onValueChange={(value: 'identity' | 'address' | 'income' | 'business') => setVerificationType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification type" />
                </SelectTrigger>
                <SelectContent>
                  {verificationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              {currentVerificationType?.requiredFields.includes('full_name') && (
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
              )}

              {currentVerificationType?.requiredFields.includes('date_of_birth') && (
                <div className="space-y-2">
                  <Label htmlFor="date-of-birth">Date of Birth</Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    required
                  />
                </div>
              )}

              {currentVerificationType?.requiredFields.includes('address') && (
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {currentVerificationType?.requiredFields.includes('city') && (
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                )}

                {currentVerificationType?.requiredFields.includes('state') && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                )}
              </div>

              {currentVerificationType?.requiredFields.includes('zip_code') && (
                <div className="space-y-2">
                  <Label htmlFor="zip-code">ZIP Code</Label>
                  <Input
                    id="zip-code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required Documents</h3>
              
              {currentVerificationType?.documents.map(docType => (
                <div key={docType} className="space-y-2">
                  <Label htmlFor={`${docType}-document`}>
                    {docType.charAt(0).toUpperCase() + docType.slice(1)} Document
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id={`${docType}-document`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e, docType)}
                      className="flex-1"
                    />
                    {uploadedFiles[docType as keyof typeof uploadedFiles] && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Uploaded
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Upload a clear image or PDF of your {docType} document (Max 10MB)
                  </p>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
