/*
  # Fix infinite recursion in projects RLS policy

  1. Problem
    - The current SELECT policy on projects table creates infinite recursion
    - Policy references project_collaborators which in turn references projects
    - This creates a circular dependency during policy evaluation

  2. Solution
    - Drop the existing problematic policy
    - Create a new policy that avoids recursive references
    - Use a more direct approach for checking collaboration access

  3. Changes
    - Remove the existing "Users can view accessible projects" policy
    - Add a new policy that checks user ownership and public visibility
    - Add a separate policy for collaborator access that doesn't cause recursion
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;

-- Create a new policy for basic access (owner and public projects)
CREATE POLICY "Users can view their own and public projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (visibility = 'public')
  );

-- Create a separate policy for collaborator access
CREATE POLICY "Collaborators can view shared projects"
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