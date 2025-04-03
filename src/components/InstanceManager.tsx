"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { AWSCredentialsForm } from './AWSCredentialsForm'

interface Instance {
  InstanceId: string
  State: {
    Name: string
    Code: number
  }
  Tags?: Array<{
    Key: string
    Value: string
  }>
  PublicDnsName?: string
  LaunchTime: string
}

interface AWSCredentials {
  organization_id?: string
  account_id?: string
  iam_username?: string
}

export function InstanceManager() {
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<AWSCredentials | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchCredentials()
    fetchInstances()
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

  const fetchInstances = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/aws-instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list' }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      setInstances(data.instances || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch instances')
    } finally {
      setLoading(false)
    }
  }

  const handleInstanceAction = async (action: string, instanceId: string) => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/aws-instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, instanceId }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      await fetchInstances()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstance = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/aws-instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'create' }),
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      await fetchInstances()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create instance')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Instances</h2>
        {credentials?.organization_id ? (
          <Button onClick={handleCreateInstance} disabled={loading}>
            Create New Instance
          </Button>
        ) : (
          <div className="text-sm text-gray-500">
            AWS credentials required to create instances
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!credentials?.organization_id ? (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AWS Setup Required</h3>
            <p className="text-gray-500">
              To create and manage instances, you need to set up your AWS organization first.
              This will create a new AWS account for you with the necessary permissions.
            </p>
            <AWSCredentialsForm />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => (
            <Card key={instance.InstanceId} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {instance.InstanceId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    instance.State.Name === 'running' ? 'bg-green-100 text-green-800' :
                    instance.State.Name === 'stopped' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {instance.State.Name}
                  </span>
                </div>

                {instance.PublicDnsName && (
                  <p className="text-sm text-gray-500">
                    DNS: {instance.PublicDnsName}
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  Launched: {new Date(instance.LaunchTime).toLocaleString()}
                </p>

                <div className="flex gap-2 mt-4">
                  {instance.State.Name === 'stopped' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInstanceAction('start', instance.InstanceId)}
                      disabled={loading}
                    >
                      Start
                    </Button>
                  )}
                  {instance.State.Name === 'running' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInstanceAction('stop', instance.InstanceId)}
                      disabled={loading}
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleInstanceAction('terminate', instance.InstanceId)}
                    disabled={loading}
                  >
                    Terminate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {credentials?.organization_id && instances.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No instances found. Create your first instance to get started.
        </div>
      )}
    </div>
  )
} 