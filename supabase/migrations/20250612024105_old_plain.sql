/*
  # Fix infinite recursion in projects RLS policies

  1. Problem
    - The existing RLS policies on the projects table are causing infinite recursion
    - The collaborator access policy has a subquery that creates a recursive dependency

  2. Solution
    - Drop the existing problematic policies
    - Create new, simplified policies that avoid recursion
    - Ensure proper access control without circular references

  3. Security
    - Maintain the same access levels (own projects, public projects, collaborator access)
    - Use simpler, non-recursive policy logic
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "projects_basic_access" ON projects;
DROP POLICY IF EXISTS "projects_collaborator_access" ON projects;
DROP POLICY IF EXISTS "projects_delete_own" ON projects;
DROP POLICY IF EXISTS "projects_insert_own" ON projects;
DROP POLICY IF EXISTS "projects_update_own" ON projects;

-- Create new, simplified policies without recursion

-- Allow users to view their own projects and public projects
CREATE POLICY "projects_select_policy"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    visibility = 'public'
  );

-- Allow users to view projects they collaborate on
CREATE POLICY "projects_select_collaborator_policy"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM project_collaborators pc 
      WHERE pc.project_id = projects.id 
        AND pc.user_id = auth.uid() 
        AND pc.accepted_at IS NOT NULL
    )
  );

-- Allow users to insert their own projects
CREATE POLICY "projects_insert_policy"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own projects
CREATE POLICY "projects_update_policy"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own projects
CREATE POLICY "projects_delete_policy"
  ON projects
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());