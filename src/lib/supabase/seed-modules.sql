-- ==============================================================================
-- SEED: 15 TITAN MODULES (Global Templates)
-- ==============================================================================

-- Clean up existing global modules to avoid duplicates if re-running
delete from public.modules where is_global = true;

insert into public.modules (title, slug, description, duration_min, is_global, visibility, content_markdown)
values
(
  'El Eslabón Humano más Fuerte', 
  'eslabon-humano', 
  'Entiende por qué las personas somos el objetivo principal de los ciberataques y cómo convertirte en la primera línea de defensa.', 
  10, true, 'global_template', 
  '# El Factor Humano en la Ciberseguridad\n\nLa tecnología puede fallar, pero el error humano es la causa del 90% de las brechas. Aprende a identificar tu rol en la seguridad de la organización.\n\n## Temas Clave\n- Psicología del atacante\n- Ingeniería Social básica\n- Responsabilidad compartida'
),
(
  'Ingeniería Social: El Arte del Engaño', 
  'ingenieria-social', 
  'Descubre las tácticas psicológicas que usan los criminales para manipularte y obtener información confidencial.', 
  15, true, 'global_template',
  '# Manipulación Psicológica\n\nLos atacantes no necesitan hackear sistemas si pueden hackear personas. \n\n## Tácticas Comunes\n- Urgencia\n- Autoridad\n- Curiosidad\n- Miedo'
),
(
  'Phishing, Vishing y Smishing', 
  'phishing-vishing-smishing', 
  'Identifica correos, llamadas y mensajes fraudulentos diseñados para robar tus credenciales y datos bancarios.', 
  12, true, 'global_template',
  '# Vectores de Ataque\n\n- **Phishing**: Correo electrónico.\n- **Vishing**: Llamadas telefónicas.\n- **Smishing**: SMS/Mensajería.\n\nAprende a detectar remitentes falsos y enlaces maliciosos.'
),
(
  'MFA y Passkeys: Tu Escudo Digital', 
  'mfa-passkeys', 
  'Por qué las contraseñas ya no son suficientes y cómo la autenticación multifactor protege tu identidad digital.', 
  8, true, 'global_template',
  '# Autenticación Robusta\n\nActivar MFA bloquea el 99.9% de los ataques automatizados. \n\n## Tipos de MFA\n- SMS (Menos seguro)\n- App Autenticadora (Recomendado)\n- Llaves FIDO (Nivel Militar)'
),
(
  'Malware y Ransomware', 
  'malware-ransomware', 
  'Cómo funciona el software malicioso y qué hacer si tu dispositivo es secuestrado por un ransomware.', 
  15, true, 'global_template',
  '# Software Malicioso\n\nEl Ransomware cifra tus archivos y pide rescate. \n\n## Prevención\n- No descargar software pirata\n- Mantener antivirus actualizado\n- Backups regulares'
),
(
  'Seguridad Física y Tailgating', 
  'seguridad-fisica-tailgating', 
  'La seguridad no es solo digital. Aprende a proteger el acceso físico a las oficinas y evitar el "piggybacking".', 
  10, true, 'global_template',
  '# Seguridad en el Mundo Real\n\nNo permitas que desconocidos entren detrás de ti ("Tailgating"). Protege tus dispositivos cuando no estés en tu escritorio.'
),
(
  'Navegación Segura y Sitios Clonados', 
  'navegacion-segura-sitios-clonados', 
  'Detecta sitios web falsos que imitan a los legítimos y navega por internet sin comprometer la red corporativa.', 
  10, true, 'global_template',
  '# Higiene de Navegación\n\nVerifica siempre el dominio (URL). Usa HTTPS. No introduzcas credenciales en sitios no verificados.'
),
(
  'Peligros del Wi-Fi Público', 
  'wifi-publico', 
  'Los riesgos de conectarse a redes abiertas en cafeterías o aeropuertos y cómo usar una VPN para protegerte.', 
  8, true, 'global_template',
  '# Redes No Confiables\n\nEn un Wi-Fi público, cualquiera puede interceptar tu tráfico ("Man-in-the-Middle"). Usa siempre la VPN corporativa.'
),
(
  'Big Data y Privacidad', 
  'big-data-privacy', 
  'Cómo se recopilan y usan tus datos personales en la era digital y cómo minimizar tu huella digital.', 
  12, true, 'global_template',
  '# Tu Huella Digital\n\nTodo lo que haces en línea deja rastro. Aprende a configurar la privacidad en redes sociales y navegadores.'
),
(
  'Baiting y Dispositivos USB', 
  'baiting-usb', 
  'El viejo truco del USB perdido: por qué nunca debes conectar dispositivos desconocidos a tu equipo de trabajo.', 
  8, true, 'global_template',
  '# El Caballo de Troya Físico\n\nUn USB encontrado puede instalar malware automáticamente al conectarse (HID Attacks).'
),
(
  'BEC: Fraude del CEO', 
  'bec-fraude-ceo', 
  'Business Email Compromise: Cuando el atacante se hace pasar por un directivo para ordenar transferencias urgentes.', 
  15, true, 'global_template',
  '# Ataques a Ejecutivos\n\nEl fraude del CEO no usa malware, usa manipulación. Verifica siempre las solicitudes de dinero por un canal alternativo.'
),
(
  'Seguridad Móvil y BYOD', 
  'seguridad-movil-byod', 
  'Protege tu smartphone y tablet. Riesgos de usar dispositivos personales para trabajo (Bring Your Own Device).', 
  10, true, 'global_template',
  '# Dispositivos de Bolsillo\n\nTu celular tiene más información que tu PC. Usa bloqueo biométrico, cifrado y borrado remoto.'
),
(
  'Riesgos de la IA Generativa', 
  'riesgos-ia-generativa', 
  'Cómo usar ChatGPT y herramientas de IA sin filtrar datos confidenciales de la empresa.', 
  12, true, 'global_template',
  '# IA y Confidencialidad\n\nNunca subas datos privados, código fuente o estrategias de negocio a IAs públicas. Todo lo que escribes puede ser usado para entrenar el modelo.'
),
(
  'Cultura de Reporte: No Castigo', 
  'respuesta-temprana-no-castigo', 
  'Fomentar una cultura donde reportar un error de seguridad es premiado, no castigado. La velocidad es clave.', 
  8, true, 'global_template',
  '# Si ves algo, di algo\n\nEl miedo al castigo retrasa la respuesta ante incidentes. Reportar un clic accidental puede salvar a la empresa.'
),
(
  'Arquitectura Zero Trust', 
  'zero-trust', 
  'El principio de "Nunca confiar, siempre verificar". Por qué la seguridad perimetral ya no es suficiente.', 
  15, true, 'global_template',
  '# Confianza Cero\n\nAsumimos que la brecha ya ocurrió. Cada acceso debe ser autenticado, autorizado y cifrado, sin importar si estás en la oficina o en casa.'
);
