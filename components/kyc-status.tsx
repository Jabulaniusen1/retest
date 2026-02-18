'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KYCVerification } from '@/components/kyc-verification'
import { CheckCircle, Clock, XCircle, FileText, AlertCircle } from 'lucide-react'
import type { KYCVerification as KYCVerificationType } from '@/types'

export function KYCStatus() {
  const { user } = useAuth()
  const [verifications, setVerifications] = useState<KYCVerificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [showVerificationForm, setShowVerificationForm] = useState(false)

  useEffect(() => {
    if (user) {
      loadVerifications()
    }
  }, [user])

  const loadVerifications = async () => {
    if (!user) return
    
    try {
      const data = await apiClient.getKYCVerifications(user.id)
      setVerifications(data || [])
    } catch (error) {
      console.error('Error loading verifications:', error)
      // Gracefully handle error by setting empty array
      setVerifications([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'under_review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      under_review: 'outline',
      rejected: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getVerificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      identity: 'Identity Verification',
      address: 'Address Verification',
      income: 'Income Verification',
      business: 'Business Verification'
    }
    return labels[type] || type
  }

  const isFullyVerified = verifications.some(v => v.status === 'approved')

  if (loading) {
    return <div className="flex justify-center p-8">Loading verification status...</div>
  }

  if (showVerificationForm) {
    return (
      <div>
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowVerificationForm(false)}
          >
            ← Back to Status
          </Button>
        </div>
        <KYCVerification onVerificationComplete={loadVerifications} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">KYC Verification</h2>
        <p className="text-gray-600">Manage your identity verification status</p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isFullyVerified ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span>Verified Account</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <span>Verification Required</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isFullyVerified 
              ? 'Your account is fully verified. You have access to all features.'
              : 'Complete verification to unlock premium account types and higher limits.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {verifications.filter(v => v.status === 'approved').length} of {verifications.length} verifications completed
              </p>
            </div>
            <Button onClick={() => setShowVerificationForm(true)}>
              {isFullyVerified ? 'Update Verification' : 'Complete Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Details */}
      <div className="grid gap-4">
        {verifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No verifications submitted</h3>
              <p className="text-gray-600 text-center mb-4">
                Start your verification process to access premium features
              </p>
              <Button onClick={() => setShowVerificationForm(true)}>
                Start Verification
              </Button>
            </CardContent>
          </Card>
        ) : (
          verifications.map(verification => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {getVerificationTypeLabel(verification.verification_type)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(verification.status)}
                    {getStatusBadge(verification.status)}
                  </div>
                </div>
                <CardDescription>
                  Submitted on {new Date(verification.submitted_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verification.full_name && (
                    <div>
                      <span className="font-medium">Name:</span> {verification.full_name}
                    </div>
                  )}
                  
                  {verification.address && (
                    <div>
                      <span className="font-medium">Address:</span> {verification.address}
                    </div>
                  )}
                  
                  {verification.rejection_reason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800 mb-1">Rejection Reason:</div>
                      <div className="text-red-700">{verification.rejection_reason}</div>
                    </div>
                  )}
                  
                  {verification.notes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium text-blue-800 mb-1">Notes:</div>
                      <div className="text-blue-700">{verification.notes}</div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-2">
                    {verification.status === 'rejected' && (
                      <Button 
                        size="sm" 
                        onClick={() => setShowVerificationForm(true)}
                      >
                        Resubmit
                      </Button>
                    )}
                    {verification.status === 'pending' && (
                      <Button size="sm" variant="outline" disabled>
                        Under Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Benefits of Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of Verification</CardTitle>
          <CardDescription>
            Complete your KYC verification to unlock these features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Premium Account Types</div>
                <div className="text-sm text-gray-600">
                  Access to investment, business, and credit accounts
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Higher Transaction Limits</div>
                <div className="text-sm text-gray-600">
                  Increased daily and monthly transfer limits
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Better Interest Rates</div>
                <div className="text-sm text-gray-600">
                  Preferential rates on savings and investment accounts
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Priority Support</div>
                <div className="text-sm text-gray-600">
                  Faster response times from customer support
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
