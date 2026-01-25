import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthCheck {
  id: string;
  category: string;
  check_name: string;
  status: 'ok' | 'warn' | 'critical' | 'unknown';
  evidence: Record<string, unknown>;
  likely_cause: string | null;
  suggested_fix: string | null;
  requires_approval: boolean;
  checked_at: string;
}

export interface StoreSnapshot {
  id: string;
  snapshot_type: string;
  snapshot_data: Record<string, unknown>;
  diff_from_previous: Record<string, unknown> | null;
  created_at: string;
}

export interface OpsAction {
  id: string;
  action_type: string;
  action_title: string;
  action_description: string | null;
  target_resource: string | null;
  planned_changes: Record<string, unknown>;
  risk_level: string;
  status: string;
  created_at: string;
}

export interface AgentResponse {
  answer: string;
  sources: Array<{ title: string; namespace: string; similarity: number }>;
  currentStatus: Record<string, unknown> | null;
  recommendations: string[];
  actionsRequiringApproval: Array<{
    type: string;
    description: string;
    requiresApproval: boolean;
    riskLevel: string;
  }>;
  risks: string[];
}

export function useStoreOpsAgent() {
  const [isLoading, setIsLoading] = useState(false);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [snapshots, setSnapshots] = useState<StoreSnapshot[]>([]);
  const [pendingActions, setPendingActions] = useState<OpsAction[]>([]);

  const invokeAgent = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('store-ops-agent', {
        body: { action, ...params },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Unknown error');

      return data;
    } catch (error) {
      console.error('Store Ops Agent error:', error);
      toast.error(`Agent error: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runHealthCheck = useCallback(async () => {
    const result = await invokeAgent('health_check');
    if (result?.checks) {
      setHealthChecks(result.checks);
    }
    return result;
  }, [invokeAgent]);

  const getStoreConfig = useCallback(async () => {
    return invokeAgent('get_store_config');
  }, [invokeAgent]);

  const getAppsIntegrations = useCallback(async () => {
    return invokeAgent('get_apps');
  }, [invokeAgent]);

  const chat = useCallback(async (message: string, mode: string = 'assist'): Promise<AgentResponse> => {
    const result = await invokeAgent('chat', { message, mode });
    return result?.response;
  }, [invokeAgent]);

  const createSnapshot = useCallback(async (snapshotType: string = 'full') => {
    const result = await invokeAgent('create_snapshot', { snapshotType });
    if (result?.snapshot) {
      setSnapshots(prev => [result.snapshot, ...prev]);
    }
    return result;
  }, [invokeAgent]);

  const getHealthHistory = useCallback(async (limit: number = 100) => {
    const result = await invokeAgent('get_health_history', { limit });
    if (result?.checks) {
      setHealthChecks(result.checks);
    }
    return result;
  }, [invokeAgent]);

  const getSnapshots = useCallback(async (limit: number = 20) => {
    const result = await invokeAgent('get_snapshots', { limit });
    if (result?.snapshots) {
      setSnapshots(result.snapshots);
    }
    return result;
  }, [invokeAgent]);

  const getPendingActions = useCallback(async () => {
    const result = await invokeAgent('get_pending_actions');
    if (result?.actions) {
      setPendingActions(result.actions);
    }
    return result;
  }, [invokeAgent]);

  const approveAction = useCallback(async (actionId: string) => {
    const result = await invokeAgent('approve_action', { actionId });
    if (result?.success) {
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      toast.success('Action approved');
    }
    return result;
  }, [invokeAgent]);

  const ragSearch = useCallback(async (query: string, namespaces?: string[], limit?: number) => {
    return invokeAgent('rag_search', { query, namespaces, limit });
  }, [invokeAgent]);

  const ingestKnowledge = useCallback(async (params: {
    namespace: string;
    title: string;
    content: string;
    sourceUrl?: string;
    sourceType?: string;
    tags?: string[];
  }) => {
    return invokeAgent('ingest_knowledge', params);
  }, [invokeAgent]);

  return {
    isLoading,
    healthChecks,
    snapshots,
    pendingActions,
    runHealthCheck,
    getStoreConfig,
    getAppsIntegrations,
    chat,
    createSnapshot,
    getHealthHistory,
    getSnapshots,
    getPendingActions,
    approveAction,
    ragSearch,
    ingestKnowledge,
  };
}