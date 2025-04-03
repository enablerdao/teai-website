"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface AWSCredentials {
  organization_id?: string
  account_id?: string
  iam_username?: string
}

export function AWSCredentialsForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<AWSCredentials | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('aws_credentials')
        .select('organization_id, account_id, iam_username')
        .eq('user_id', session.user.id)
        .single()

      if (error) throw error
      setCredentials(data)
    } catch (err) {
      console.error('Failed to fetch credentials:', err)
    }
  }

  const handleCreateOrganization = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/aws-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'create_organization' }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      
      setSuccess(true)
      await fetchCredentials()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      {credentials?.organization_id ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Organization ID</Label>
            <Input value={credentials.organization_id} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Account ID</Label>
            <Input value={credentials.account_id} readOnly />
          </div>
          <div className="space-y-2">
            <Label>IAM Username</Label>
            <Input value={credentials.iam_username} readOnly />
          </div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Your AWS organization and account have been created successfully!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-500">
            Click the button below to create your AWS organization and account. This will:
          </p>
          <ul className="list-disc list-inside text-gray-500 space-y-2">
            <li>Create a new AWS organization</li>
            <li>Create an organizational unit for your account</li>
            <li>Create a new AWS account</li>
            <li>Create an IAM user with necessary permissions</li>
          </ul>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button 
            onClick={handleCreateOrganization} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Organization...
              </>
            ) : (
              'Create AWS Organization'
            )}
          </Button>
        </div>
      )}
    </Card>
  )
} 