/*
  # Fix Projects RLS Policy Infinite Recursion

  1. Problem
    - The existing policies are causing infinite recursion
    - Some policies already exist from previous migrations
    - Need to safely drop and recreate without conflicts

  2. Solution
    - Drop ALL existing policies on projects table
    - Create new non-recursive policies
    - Ensure proper access control without circular references

  3. Changes
    - Remove all existing SELECT policies on projects
    - Add simple policy for user's own projects and public projects
    - Add separate collaborator policy that avoids recursion
*/

-- First, drop ALL existing policies on the projects table to start clean
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies for the projects table
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'projects' AND schemaname = 'public'
    LOOP
        -- Drop each policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Now create the new, non-recursive policies
CREATE POLICY "Users can view their own and public projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (visibility = 'public')
  );

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

-- Recreate the other essential policies that were dropped
CREATE POLICY "Users can create their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);