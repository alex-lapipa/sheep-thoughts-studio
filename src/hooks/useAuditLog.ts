import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const log = async ({
    action,
    entityType,
    entityId,
    beforeData,
    afterData,
    metadata,
  }: AuditLogParams): Promise<boolean> => {
    if (!user?.id) return false;

    const { error } = await supabase.from('audit_logs').insert([{
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_data: beforeData as any,
      after_data: afterData as any,
      metadata: metadata as any,
    }]);

    if (error) {
      console.error('Failed to create audit log:', error);
      return false;
    }

    return true;
  };

  return { log };
}
