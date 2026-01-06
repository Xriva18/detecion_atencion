-- =============================================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS - SISTEMA DE DETECCIÓN DE ATENCIÓN
-- =============================================================================
-- Este script adapta el esquema relacional propuesto Para trabajar nativamente
-- con Supabase Auth y la tabla 'profiles' existente.
-- Se usan UUIDs para usuarios (estándar de Supabase) y snake_case para convenciones.

-- 1. CONFIGURACIÓN DE ROLES
-- Creamos la tabla de roles para dar sentido a los IDs 1, 2, 3 que ya usas.
create table if not exists roles (
  id int primary key,
  name text not null
);

-- Insertamos los roles por defecto si no existen
insert into roles (id, name) values 
  (1, 'administrador'), 
  (2, 'profesor'), 
  (3, 'estudiante')
on conflict (id) do nothing;

-- 2. INTEGRACIÓN CON PROFILES (Existente)
-- Aseguramos que la tabla profiles tenga la restricción de clave foránea correcta.
-- Nota: Asumimos que 'profiles.user_id' ya es FK a 'auth.users'.
-- Si 'profiles.role' es un entero, lo vinculamos a nuestra nueva tabla roles.
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'profiles_role_fkey') then
    alter table profiles 
    add constraint profiles_role_fkey 
    foreign key (role) references roles(id);
  end if;
end $$;

-- 3. CLASES (Equivalente a 'Clase')
-- Las clases son creadas por profesores.
create table if not exists classes (
  id uuid default gen_random_uuid() primary key,
  professor_id uuid references profiles(user_id) not null,
  name text not null,          -- 'clase_nom'
  description text,            -- 'clase_descr'
  code text unique,            -- 'clase_cod' (para unirse)
  schedule text,               -- 'clase_horario'
  is_active boolean default true, -- 'clase_habil'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. INSCRIPCIONES (Equivalente a 'inscritos_clase')
-- Relaciona estudiantes con clases.
create table if not exists class_enrollments (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references profiles(user_id) on delete cascade,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  unique(class_id, student_id) -- Un estudiante no se puede inscribir dos veces a la misma clase
);

-- 5. TAREAS / VIDEOS (Equivalente a 'Tareas' + 'videos')
-- Representa un video asignado dentro de una clase.
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references classes(id) on delete cascade,
  title text not null,         -- 'tarea_nom'
  description text,            -- 'tarea_des'
  video_url text not null,     -- 'tarea_video_url' (Ruta en Supabase Storage)
  
  -- Campos para IA
  video_summary text,          -- Resumen generado por IA
  video_transcript text,       -- Transcripción completa
  
  duration_seconds int,        -- 'tarea_duracion'
  is_active boolean default true, -- 'tarea_habil'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. SESIONES DE ACTIVIDAD (Equivalente a 'resultados' + 'sesion_auditoria')
-- Registra el intento de un estudiante de ver un video/tarea.
create table if not exists activity_sessions (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references tasks(id) on delete cascade,
  student_id uuid references profiles(user_id) on delete cascade,
  
  -- Métricas de Atención
  attention_score_avg float,   -- Promedio de atención (0.0 - 1.0)
  attention_data jsonb,        -- Datos detallados (opcional, logs por minuto)
  
  -- Estado
  status text check (status in ('started', 'completed')) default 'started',
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- 7. CUESTIONARIOS GENERADOS (Nuevo / Integración IA)
-- Almacena el Quiz generado dinámicamente para esa sesión específica.
create table if not exists generated_quizzes (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references activity_sessions(id) on delete cascade,
  content jsonb not null,      -- El JSON con preguntas y respuestas generado por Gemini
  student_answers jsonb,       -- (OPCIONAL) Las respuestas específicas que eligió el estudiante { "q1": "a", ... }
  
  -- Resultados del Quiz
  score_obtained float,        -- Calificación obtenida
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS) - "Lo que pediste sobre ver solo lo suyo"
-- =============================================================================

-- Habilitar RLS en todas las tablas nuevas
alter table classes enable row level security;
alter table class_enrollments enable row level security;
alter table tasks enable row level security;
alter table activity_sessions enable row level security;
alter table generated_quizzes enable row level security;

-- --- POLÍTICAS PARA CLASES ---
-- Profesores pueden ver todas las clases
create policy "Profesores ven todo (o solo suyas)" on classes 
for select using ( 
    (select role from profiles where user_id = auth.uid()) in (1, 2) 
);

-- Estudiantes solo ven clases donde están inscritos
create policy "Estudiantes ven sus clases" on classes 
for select using (
    exists (select 1 from class_enrollments where class_id = classes.id and student_id = auth.uid())
);

-- Admin/Profesor pueden crear clases
create policy "Profesores crean clases" on classes 
for insert with check (
    (select role from profiles where user_id = auth.uid()) in (1, 2)
);

-- --- POLÍTICAS PARA TAREAS/VIDEOS ---
-- Visibles si el usuario tiene acceso a la clase (Profesor dueño o Estudiante inscrito)
create policy "Acceso a tareas por clase" on tasks
for select using (
    -- Es Profesor/Admin
    (select role from profiles where user_id = auth.uid()) in (1, 2)
    OR
    -- Es Estudiante inscrito
    exists (select 1 from class_enrollments where class_id = tasks.class_id and student_id = auth.uid())
);

-- --- POLÍTICAS PARA SESIONES Y QUIZZES (Datos privados del estudiante) ---
-- Estudiantes solo ven sus propias sesiones
create policy "Estudiantes ven sus sesiones" on activity_sessions
for all using ( student_id = auth.uid() );

-- Profesores pueden ver sesiones de tareas que ellos crearon (Monitorización)
-- (Esta consulta es un poco más compleja, simplificada para rendimiento)
create policy "Profesores ven sesiones de sus clases" on activity_sessions
for select using (
    exists (
        select 1 from tasks 
        join classes on tasks.class_id = classes.id 
        where tasks.id = activity_sessions.task_id 
        and classes.professor_id = auth.uid()
    )
);

-- Repetir lógica similar para quizzes
create policy "Acceso a quizzes propio o de profesor" on generated_quizzes
for all using (
    exists (
        select 1 from activity_sessions 
        where activity_sessions.id = session_id 
        and (activity_sessions.student_id = auth.uid() -- Es mi quiz
             OR 
             exists ( -- O soy el profesor revisando
                select 1 from tasks 
                join classes on tasks.class_id = classes.id 
                where tasks.id = activity_sessions.task_id 
                and classes.professor_id = auth.uid()
             )
        )
    )
);
