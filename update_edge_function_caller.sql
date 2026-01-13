-- Quick Update: Edge Function Caller with Service Role Key
-- This updates only the function that calls your edge function
-- Replace YOUR_SERVICE_ROLE_KEY_HERE with your actual service role key

-- STEP 1: Get your service role key from:
-- https://supabase.com/dashboard/project/mnnoucvlyxridktelpxs/settings/api
-- Copy the "service_role" key (it starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

-- STEP 2: Replace YOUR_SERVICE_ROLE_KEY_HERE below with your actual key

-- STEP 3: Run this SQL in Supabase SQL Editor

CREATE OR REPLACE FUNCTION call_send_gift_notification_edge_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id BIGINT;
  service_key TEXT := 'YOUR_SERVICE_ROLE_KEY_HERE'; -- REPLACE THIS!
BEGIN
  SELECT net.http_post(
    url := 'https://mnnoucvlyxridktelpxs.supabase.co/functions/v1/send-gift-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object('mode', 'batch')
  ) INTO request_id;
  
  RAISE NOTICE 'Called edge function with request_id: %', request_id;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to call edge function: %', SQLERRM;
END;
$$;

-- STEP 4: Test the function
SELECT call_send_gift_notification_edge_function();

-- STEP 5: Check the result
-- Go to Edge Functions logs to see if it was called successfully
-- Or check: SELECT * FROM net.http_request_queue ORDER BY id DESC LIMIT 5;

