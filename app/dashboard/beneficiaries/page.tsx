'use client'

import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Users, Plus, Edit2, Trash2, Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Beneficiary {
  id: string
  user_id: string
  name: string
  account_number: string
  bank_name?: string
  nickname?: string
  created_at: string
}

export default function BeneficiariesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    bank_name: '',
    nickname: ''
  })

  useEffect(() => {
    if (user) {
      fetchBeneficiaries()
    }
  }, [user])

  const fetchBeneficiaries = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await apiClient.getBeneficiaries(user.id)
      setBeneficiaries(data)
    } catch (error) {
      console.error('Error fetching beneficiaries:', error)
      toast({
        title: 'Error',
        description: 'Failed to load beneficiaries',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddBeneficiary = async () => {
    if (!user || !formData.name || !formData.account_number) {
      toast({
        title: 'Error',
        description: 'Name and account number are required',
        variant: 'destructive'
      })
      return
    }

    try {
      await apiClient.createBeneficiary(
        user.id,
        formData.account_number,
        formData.name,
        formData.nickname || undefined
      )
      toast({
        title: 'Success',
        description: 'Beneficiary added successfully'
      })
      setShowAddDialog(false)
      setFormData({ name: '', account_number: '', bank_name: '', nickname: '' })
      fetchBeneficiaries()
    } catch (error) {
      console.error('Error adding beneficiary:', error)
      toast({
        title: 'Error',
        description: 'Failed to add beneficiary',
        variant: 'destructive'
      })
    }
  }

  const handleEditBeneficiary = async () => {
    if (!selectedBeneficiary) return

    try {
      await apiClient.updateBeneficiary(selectedBeneficiary.id, {
        name: formData.name,
        nickname: formData.nickname || undefined
      })
      toast({
        title: 'Success',
        description: 'Beneficiary updated successfully'
      })
      setShowEditDialog(false)
      setSelectedBeneficiary(null)
      setFormData({ name: '', account_number: '', bank_name: '', nickname: '' })
      fetchBeneficiaries()
    } catch (error) {
      console.error('Error updating beneficiary:', error)
      toast({
        title: 'Error',
        description: 'Failed to update beneficiary',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteBeneficiary = async () => {
    if (!selectedBeneficiary) return

    try {
      await apiClient.deleteBeneficiary(selectedBeneficiary.id)
      toast({
        title: 'Success',
        description: 'Beneficiary deleted successfully'
      })
      setShowDeleteDialog(false)
      setSelectedBeneficiary(null)
      fetchBeneficiaries()
    } catch (error) {
      console.error('Error deleting beneficiary:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete beneficiary',
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setFormData({
      name: beneficiary.name,
      account_number: beneficiary.account_number,
      bank_name: beneficiary.bank_name || '',
      nickname: beneficiary.nickname || ''
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary)
    setShowDeleteDialog(true)
  }

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.account_number.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-foreground/60">Loading beneficiaries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 md:h-8 md:w-8" />
            Beneficiaries
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your saved recipients
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Beneficiary
        </Button>
      </div>

      {/* Search */}
      {beneficiaries.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, nickname, or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Beneficiaries List */}
      {filteredBeneficiaries.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No beneficiaries found' : 'No beneficiaries yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Add beneficiaries to send money faster'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Beneficiary
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBeneficiaries.map((beneficiary) => (
            <Card key={beneficiary.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {beneficiary.nickname || beneficiary.name}
                    </h3>
                    {beneficiary.nickname && (
                      <p className="text-xs text-muted-foreground">{beneficiary.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-mono text-foreground">
                    {beneficiary.account_number}
                  </span>
                </div>
                {beneficiary.bank_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="text-foreground">{beneficiary.bank_name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(beneficiary)}
                >
                  <Edit2 className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => openDeleteDialog(beneficiary)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Beneficiary Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Beneficiary</DialogTitle>
            <DialogDescription>
              Add a new beneficiary to send money faster
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number *</label>
              <Input
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                placeholder="ACC1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nickname (Optional)</label>
              <Input
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., Mom, Best Friend"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBeneficiary}>Add Beneficiary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Beneficiary Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Beneficiary</DialogTitle>
            <DialogDescription>
              Update beneficiary information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <Input
                value={formData.account_number}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Account number cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nickname (Optional)</label>
              <Input
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                placeholder="e.g., Mom, Best Friend"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBeneficiary}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Beneficiary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedBeneficiary?.nickname || selectedBeneficiary?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBeneficiary}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
