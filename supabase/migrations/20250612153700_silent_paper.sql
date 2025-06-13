/*
  # Fix Projects RLS Policies - Remove Infinite Recursion

  1. Problem
    - The `projects_select_collaborator_policy` is causing infinite recursion
    - This happens because the policy references the `projects` table from within itself through joins

  2. Solution
    - Drop the problematic collaborator policy
    - Simplify the main select policy to avoid recursion
    - Create a more efficient policy structure that doesn't cause circular references

  3. Security
    - Maintain proper access control for project visibility
    - Ensure users can only see their own projects and public projects
    - Handle collaborator access through application logic rather than complex RLS
*/

-- Drop the problematic collaborator policy that causes infinite recursion
DROP POLICY IF EXISTS "projects_select_collaborator_policy" ON projects;

-- Update the main select policy to be simpler and avoid recursion
DROP POLICY IF EXISTS "projects_select_policy" ON projects;

CREATE POLICY "projects_select_policy"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    visibility = 'public'
  );

-- Create a separate, simpler policy for shared projects if needed
-- This avoids the recursive join that was causing the issue
CREATE POLICY "projects_select_shared_policy"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'shared' AND 
    id IN (
      SELECT pc.project_id 
      FROM project_collaborators pc 
      WHERE pc.user_id = auth.uid() 
      AND pc.accepted_at IS NOT NULL
    )
  );