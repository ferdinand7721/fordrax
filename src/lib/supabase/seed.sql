-- 1. Create Admin User (This usually happens via Auth API, but we can seed the PROFILE here if the user exists)
-- NOTE: The user 'admin@fordrax.com' must be created in Authentication > Users first or via script. 
-- We will assume the user ID will be provided or we use a placeholder that the user must replace.

-- 2. Create Demo Organization
insert into public.organizations (name, slug, domain)
values ('Fordrax Demo Corp', 'fordrax-demo', 'fordrax.com');

-- 3. Get the Org ID (for use in members)
do $$
declare
  v_org_id uuid;
  v_module_id uuid;
begin
  select id into v_org_id from public.organizations where slug = 'fordrax-demo';

  -- 4. Seed Global Modules
  insert into public.modules (title, description, content_markdown, is_global, duration_min)
  values 
    ('Phishing Fundamentals', 'Learn to identify suspicious emails.', '# Phishing 101\n\nPhishing is...', true, 10),
    ('Password Hygiene', 'Best practices for strong passwords.', '# Passwords\n\nUse managers...', true, 5),
    ('Social Engineering', 'Detecting manipulation tactics.', '# Social Engineering\n\nTrust no one...', true, 15),
    ('Device Security', 'Securing laptops and mobiles.', '# Device Safety\n\nEncryption matters...', true, 8),
    ('Public Wi-Fi Risks', 'Dangers of open networks.', '# Wi-Fi\n\nVPN is your friend...', true, 5),
    ('Data Classification', 'Understanding confidential data.', '# Data Types\n\nPublic vs Private...', true, 10),
    ('Incident Reporting', 'How and when to report incidents.', '# Reporting\n\nCall the SOC...', true, 5),
    ('Clean Desk Policy', 'Physical security basics.', '# Clean Desk\n\nLock your screen...', true, 3),
    ('Removable Media', 'USB drive safety.', '# USBs\n\nDon''t plug found drives...', true, 5),
    ('Cloud Security', 'Safe use of SaaS apps.', '# Cloud\n\nShadow IT risks...', true, 10),
    ('Identity Theft', 'Protecting personal info.', '# Identity\n\nRed flags...', true, 12),
    ('Ransomware', 'Understanding malware attacks.', '# Ransomware\n\nThe encryption threat...', true, 15),
    ('Remote Work', 'Securing the home office.', '# WFH\n\nRouter security...', true, 8),
    ('Insider Threats', 'Recognizing internal risks.', '# Insider\n\nDisgruntled employees...', true, 10),
    ('Compliance 101', 'GDPR and local laws.', '# Compliance\n\nWhy it matters...', true, 20);

end $$;
