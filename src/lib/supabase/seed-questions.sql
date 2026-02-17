-- ==============================================================================
-- SEED: QUESTIONS & CHOICES (Demo Subset)
-- ==============================================================================

-- Helper to insert a question and choices easily
-- Note: This is a PL/pgSQL do block
do $$
declare
  v_module_id uuid;
  v_question_id uuid;
begin

  -- 1. Eslabon Humano
  select id into v_module_id from public.modules where slug = 'eslabon-humano' limit 1;
  if v_module_id is not null then
    -- Q1
    insert into public.questions (module_id, difficulty, prompt, explanation)
    values (v_module_id, 'basic', '¿Cuál es la causa principal de la mayoría de las brechas de seguridad?', 'El error humano representa el factor más grande en ciberseguridad.')
    returning id into v_question_id;
    
    insert into public.question_choices (question_id, label, is_correct, order_index) values
    (v_question_id, 'Fallas de hardware', false, 1),
    (v_question_id, 'Error humano / Ingeniería Social', true, 2),
    (v_question_id, 'Hackers rusos', false, 3);
  end if;

  -- 2. Phishing
  select id into v_module_id from public.modules where slug = 'phishing-vishing-smishing' limit 1;
  if v_module_id is not null then
    -- Q1
    insert into public.questions (module_id, difficulty, prompt, explanation)
    values (v_module_id, 'basic', 'Has recibido un correo urgente del CEO pidiendo una transferencia. ¿Qué haces?', 'Siempre verifica por un canal alternativo (llamada, mensaje interno) antes de actuar ante una urgencia financiera.')
    returning id into v_question_id;
    
    insert into public.question_choices (question_id, label, is_correct, order_index) values
    (v_question_id, 'Hacer la transferencia de inmediato', false, 1),
    (v_question_id, 'Verificar la dirección del remitente y contactar al CEO por otro medio', true, 2),
    (v_question_id, 'Responder al correo preguntando si es real', false, 3);
  end if;

  -- 3. MFA
  select id into v_module_id from public.modules where slug = 'mfa-passkeys' limit 1;
  if v_module_id is not null then
    -- Q1
    insert into public.questions (module_id, difficulty, prompt, explanation)
    values (v_module_id, 'medium', '¿Cuál de estos métodos de MFA es considerado el más vulnerable a ataques SIM Swapping?', 'Los SMS pueden ser interceptados si un atacante clona tu tarjeta SIM.')
    returning id into v_question_id;
    
    insert into public.question_choices (question_id, label, is_correct, order_index) values
    (v_question_id, 'Aplicación Autenticadora (TOTP)', false, 1),
    (v_question_id, 'Llave de seguridad física (YubiKey)', false, 2),
    (v_question_id, 'Mensaje de Texto (SMS)', true, 3);
  end if;

   -- 4. USB / Baiting
  select id into v_module_id from public.modules where slug = 'baiting-usb' limit 1;
  if v_module_id is not null then
    -- Q1
    insert into public.questions (module_id, difficulty, prompt, explanation)
    values (v_module_id, 'basic', 'Encuentras una memoria USB en el estacionamiento de la oficina. ¿Qué haces?', 'Conectar un dispositivo desconocido compromete inmediatamente la red.')
    returning id into v_question_id;
    
    insert into public.question_choices (question_id, label, is_correct, order_index) values
    (v_question_id, 'Conectarla para ver de quién es y devolverla', false, 1),
    (v_question_id, 'Entregarla al equipo de Seguridad/TI sin conectarla', true, 2),
    (v_question_id, 'Formatearla y usarla', false, 3);
  end if;

  -- 5. Passwords (General logic) uses Eslabon module for now or Zero Trust
  select id into v_module_id from public.modules where slug = 'zero-trust' limit 1;
  if v_module_id is not null then
     -- Q1
    insert into public.questions (module_id, difficulty, prompt, explanation)
    values (v_module_id, 'advanced', 'En un modelo Zero Trust, ¿en qué ubicación se confía por defecto?', 'Zero Trust significa Cero Confianza. No importa si estás en la oficina o en casa, se verifica todo.')
    returning id into v_question_id;
    
    insert into public.question_choices (question_id, label, is_correct, order_index) values
    (v_question_id, 'Solo en la red interna (LAN)', false, 1),
    (v_question_id, 'Solo en la VPN', false, 2),
    (v_question_id, 'En ninguna parte', true, 3);
  end if;

end $$;
