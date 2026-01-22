import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    // Collect all user data from various tables
    const exportData: Record<string, unknown> = {
      export_info: {
        generated_at: new Date().toISOString(),
        user_id: userId,
        email: userEmail,
        format_version: "1.0",
        gdpr_compliant: true,
      },
      account: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      },
    };

    // Fetch user roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (userRoles && userRoles.length > 0) {
      exportData.roles = userRoles;
    }

    // Fetch audit logs related to this user
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (auditLogs && auditLogs.length > 0) {
      exportData.audit_logs = auditLogs;
    }

    // Fetch submitted questions by this user (via IP hash or metadata)
    const { data: submittedQuestions } = await supabase
      .from('submitted_questions')
      .select('*')
      .eq('reviewed_by', userId);
    
    if (submittedQuestions && submittedQuestions.length > 0) {
      exportData.reviewed_questions = submittedQuestions;
    }

    // Fetch exceptions assigned to this user
    const { data: assignedExceptions } = await supabase
      .from('exceptions_queue')
      .select('*')
      .or(`assigned_to.eq.${userId},resolved_by.eq.${userId}`);
    
    if (assignedExceptions && assignedExceptions.length > 0) {
      exportData.assigned_exceptions = assignedExceptions;
    }

    // Fetch brand assets created by this user
    const { data: brandAssets } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('created_by', userId);
    
    if (brandAssets && brandAssets.length > 0) {
      exportData.created_brand_assets = brandAssets;
    }

    // Prepare the export
    const exportJson = JSON.stringify(exportData, null, 2);
    const filename = `bubbles-data-export-${userId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;

    return new Response(exportJson, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Generated': new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to export data', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
