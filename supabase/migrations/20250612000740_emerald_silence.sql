/*
  # Fix infinite recursion in projects RLS policies - COMPLETE SOLUTION

  1. Problem Analysis
    - Multiple policies on projects table are causing circular references
    - Need to completely clean slate and rebuild with non-recursive logic
    
  2. Solution
    - Drop ALL existing policies safely
    - Create simple, non-recursive policies
    - Ensure no policy references cause loops
    
  3. Security Maintained
    - Users can only see their own projects
    - Public projects visible to all authenticated users
    - Collaborator access through separate, clean policy
*/

-- STEP 1: Complete policy cleanup using dynamic approach
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Find and drop ALL policies on projects table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'projects' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', policy_record.policyname);
    END LOOP;
END $$;

-- STEP 2: Create clean, non-recursive policies

-- Basic access policy (no recursion)
CREATE POLICY "projects_basic_access"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR visibility = 'public'
  );

-- Collaborator access policy (separate, clean)
CREATE POLICY "projects_collaborator_access"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id 
      FROM project_collaborators 
      WHERE user_id = auth.uid() 
        AND accepted_at IS NOT NULL
    )
  );

-- CRUD policies (essential for app functionality)
CREATE POLICY "projects_insert_own"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "projects_update_own"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "projects_delete_own"
  ON projects
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());