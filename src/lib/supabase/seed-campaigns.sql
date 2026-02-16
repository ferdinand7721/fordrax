-- =========================================================
-- SEED: CAMPAIGNS & PHISHING DATA (DUMMY)
-- Requiere: Org 'fordrax-demo' y User 'admin@fordrax.com'
-- =========================================================

do $$
declare
  v_org_id uuid;
  v_user_id uuid;
  v_camp_id uuid;
  v_mod_id uuid;
  v_sim_id uuid;
begin
  -- 1. Get IDs
  select id into v_org_id from public.orgs where slug = 'fordrax-demo';
  select id into v_user_id from auth.users where email = 'admin@fordrax.com';
  
  if v_org_id is null or v_user_id is null then
    raise notice 'Skipping seed: Org or User not found.';
    return;
  end if;

  -- 2. Seed Campaigns
  -- Campaign A: Q1 Security Basics (Active)
  insert into public.campaigns (org_id, title, description, start_date, end_date, status, created_by)
  values (v_org_id, 'Q1 Security Fundamentals', 'Mandatory training for all employees regarding the new 2026 protocols.', now() - interval '5 days', now() + interval '25 days', 'active', v_user_id)
  returning id into v_camp_id;

  -- Assign to Admin
  insert into public.campaign_assignments (campaign_id, user_id, status, progress_pct, assigned_at)
  values (v_camp_id, v_user_id, 'in_progress', 45, now() - interval '4 days');

  -- Campaign B: 2025 Compliance Review (Completed)
  insert into public.campaigns (org_id, title, description, start_date, end_date, status, created_by)
  values (v_org_id, '2025 Compliance Retro', 'Review of last year incidents and lessons learned.', now() - interval '60 days', now() - interval '10 days', 'completed', v_user_id);

  -- 3. Seed Phishing Simulations
  -- Sim A: Urgent Invoice (Clicked!)
  insert into public.phishing_simulations (org_id, title, sender_name, sender_email, sent_at, target_count)
  values (v_org_id, 'Urgent: Overdue Invoice #9921', 'Accounts Payable', 'payments@fórdrax.com', now() - interval '2 days', 1)
  returning id into v_sim_id;

  -- Events for Sim A
  insert into public.phishing_events (simulation_id, user_id, event_type, occurred_at)
  values 
    (v_sim_id, v_user_id, 'sent', now() - interval '2 days'),
    (v_sim_id, v_user_id, 'opened', now() - interval '2 days' + interval '1 hour'),
    (v_sim_id, v_user_id, 'clicked', now() - interval '2 days' + interval '1 hour' + interval '5 minutes');

  -- Sim B: Password Reset (Reported)
  insert into public.phishing_simulations (org_id, title, sender_name, sender_email, sent_at, target_count)
  values (v_org_id, 'IT Support: Password Expiry', 'IT Desk', 'support@microsaft.com', now() - interval '10 days', 1)
  returning id into v_sim_id;

  -- Events for Sim B
  insert into public.phishing_events (simulation_id, user_id, event_type, occurred_at)
  values 
    (v_sim_id, v_user_id, 'sent', now() - interval '10 days'),
    (v_sim_id, v_user_id, 'opened', now() - interval '10 days' + interval '20 minutes'),
    (v_sim_id, v_user_id, 'reported', now() - interval '10 days' + interval '25 minutes');

end $$;
