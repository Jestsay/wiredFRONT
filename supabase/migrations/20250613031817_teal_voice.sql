/*
  # Create enriched views for project activities and hurdles

  1. Problem
    - Need to join project_activities with user_profiles and projects
    - PostgREST cannot traverse auth.users relationships automatically
    - Views cannot have RLS enabled directly (they inherit from base tables)

  2. Solution
    - Create views that properly join the tables
    - Views automatically inherit RLS from underlying tables
    - Grant appropriate permissions to authenticated users

  3. Security
    - Views inherit RLS policies from project_activities and project_hurdles tables
    - Access control maintained through existing table policies
*/

-- Create enriched view for project activities with user profiles
CREATE OR REPLACE VIEW public.v_project_activities_enriched AS
SELECT
  pa.id,
  pa.project_id,
  pa.user_id,
  pa.activity_type,
  pa.description,
  pa.created_at,
  up.username,
  up.avatar_url,
  p.name as project_name
FROM
  project_activities pa
LEFT JOIN
  user_profiles up ON pa.user_id = up.id
LEFT JOIN
  projects p ON pa.project_id = p.id;

-- Grant SELECT access to authenticated users
GRANT SELECT ON public.v_project_activities_enriched TO authenticated;

-- Create enriched view for project hurdles
CREATE OR REPLACE VIEW public.v_project_hurdles_enriched AS
SELECT
  ph.id,
  ph.project_id,
  ph.user_id,
  ph.title,
  ph.description,
  ph.severity,
  ph.file_path,
  ph.line_number,
  ph.is_resolved,
  ph.created_at,
  ph.updated_at,
  up.username,
  up.avatar_url,
  p.name as project_name
FROM
  project_hurdles ph
LEFT JOIN
  user_profiles up ON ph.user_id = up.id
LEFT JOIN
  projects p ON ph.project_id = p.id;

-- Grant SELECT access to authenticated users
GRANT SELECT ON public.v_project_hurdles_enriched TO authenticated;

-- Create a view for recent project activities (for dashboard)
CREATE OR REPLACE VIEW public.v_recent_project_activities AS
SELECT
  pa.id,
  pa.project_id,
  pa.user_id,
  pa.activity_type,
  pa.description,
  pa.created_at,
  up.username,
  up.avatar_url,
  p.name as project_name
FROM
  project_activities pa
LEFT JOIN
  user_profiles up ON pa.user_id = up.id
LEFT JOIN
  projects p ON pa.project_id = p.id
ORDER BY pa.created_at DESC
LIMIT 50;

-- Grant SELECT access to authenticated users
GRANT SELECT ON public.v_recent_project_activities TO authenticated;

-- Create indexes on the underlying tables to improve view performance
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at_desc 
ON project_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_hurdles_created_at_desc 
ON project_hurdles(created_at DESC);

-- Add comments for documentation
COMMENT ON VIEW public.v_project_activities_enriched IS 
'Enriched view of project activities with user and project information. Inherits RLS from project_activities table.';

COMMENT ON VIEW public.v_project_hurdles_enriched IS 
'Enriched view of project hurdles with user and project information. Inherits RLS from project_hurdles table.';

COMMENT ON VIEW public.v_recent_project_activities IS 
'Recent project activities view for dashboard display. Limited to 50 most recent activities.';