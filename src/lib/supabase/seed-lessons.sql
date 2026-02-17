-- ==============================================================================
-- SEED: LESSONS FOR MODULE 1 (El Eslabón Humano)
-- ==============================================================================

do $$
declare
  v_module_id uuid;
begin

  -- Get the module ID
  select id into v_module_id from public.modules where slug = 'eslabon-humano' limit 1;

  if v_module_id is not null then
    -- Clean existing lessons for this module to avoid duplicates
    delete from public.lessons where module_id = v_module_id;

    -- 1. Concepto Teórico
    insert into public.lessons (module_id, section_key, title, order_index, content_markdown)
    values (v_module_id, 'concepto-teorico', 'Concepto Teórico', 1, 
    '# El Factor Humano\n\nEn ciberseguridad, el "eslabón humano" se refiere a la participación de las personas en la seguridad de la información. A diferencia de los sistemas informáticos, que siguen reglas lógicas, los humanos somos emocionales, confiados y propensos a cometer errores bajo presión.\n\n### Estadísticas Clave\n- El **90%** de las brechas de seguridad comienzan con un error humano.\n- El **phishing** es el vector de ataque número 1.\n\nLos atacantes saben que es más fácil engañar a una persona para que entregue su contraseña que romper la encriptación de un servidor.');

    -- 2. Ejemplo Práctico
    insert into public.lessons (module_id, section_key, title, order_index, content_markdown)
    values (v_module_id, 'ejemplo-practico', 'Ejemplo Práctico', 2,
    '# El Caso del Correo Urgente\n\nImagina que estás en la oficina un viernes a las 5:00 PM. Recibes un correo electrónico que **parece** ser del CEO de la empresa.\n\n> "Hola, necesito que realices una transferencia urgente a este proveedor antes de que cierren los bancos. Estoy en una reunión y no puedo hablar. Hazlo ahora o perderemos el contrato."\n\n**¿Qué haces?**\n\nLa mayoría de las personas, por miedo a desobedecer o fallar, actúan de inmediato. Este es un ejemplo clásico de **Ingeniería Social** aprovechando la urgencia y la autoridad.');

    -- 3. Explicación Técnica
    insert into public.lessons (module_id, section_key, title, order_index, content_markdown)
    values (v_module_id, 'explicacion-tecnica', 'Explicación Técnica', 3,
    '# Ingeniería Social\n\nLa ingeniería social es el arte de manipular a las personas para que cedan información confidencial. Los atacantes utilizan sesgos cognitivos:\n\n1.  **Sesgo de Autoridad**: Tendemos a obedecer a figuras de poder.\n2.  **Sesgo de Urgencia**: La prisa bloquea el pensamiento crítico.\n3.  **Sesgo de Confianza**: Asumimos que si alguien conoce nuestro nombre, es legítimo.\n\n**Vector de Ataque**: El atacante falsifica la cabecera del correo ("spoofing") o utiliza un dominio similar (ej. `fordrax.co` en lugar de `fordrax.com`).');

    -- 4. Análisis a Profundidad
    insert into public.lessons (module_id, section_key, title, order_index, content_markdown)
    values (v_module_id, 'analisis-profundo', 'Análisis a Profundidad', 4,
    '# Cómo, Cuándo, Quién y Dónde\n\n### ¿Cómo?\nGeneralmente a través de correos electrónicos (Phishing), llamadas telefónicas (Vishing) o mensajes de texto (Smishing). También puede ocurrir en persona (Tailgating).\n\n### ¿Cuándo?\nSuelen ocurrir en momentos de estrés o distracción: cierre de mes, viernes por la tarde, o durante emergencias globales (ej. pandemia).\n\n### ¿Quién?\nCualquier empleado es un objetivo. Desde la recepcionista (para obtener acceso físico) hasta el director financiero (para autorizar pagos).\n\n### ¿Dónde?\nEn la oficina, en casa (trabajo remoto) o incluso en dispositivos móviles personales.');

    -- 5. Precauciones y Defensa
    insert into public.lessons (module_id, section_key, title, order_index, content_markdown)
    values (v_module_id, 'precauciones', 'Precauciones', 5,
    '# Tu Rol como Defensor\n\nPara fortalecer el eslabón humano:\n\n1.  **Detente y Verifica**: Si algo genera una emoción fuerte (miedo, urgencia, curiosidad), detente. Es una señal de alerta.\n2.  **Verificación fuera de banda**: Si recibes una solicitud inusual, contacta a la persona por otro medio (llamada, chat interno) para confirmar.\n3.  **Reporta**: Usa el botón de reporte de phishing o avisa al equipo de seguridad. Un reporte rápido puede salvar a toda la organización.\n\n**Recuerda**: Tú eres la última línea de defensa cuando la tecnología falla.');

  end if;

end $$;
