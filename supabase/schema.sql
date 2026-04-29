create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  name text not null,
  body_part text not null,
  created_at timestamptz not null default now()
);

alter table public.exercises
  add column if not exists user_id uuid references public.users (id) on delete cascade,
  add column if not exists created_at timestamptz not null default now();

alter table public.exercises
  drop constraint if exists exercises_name_key;

create unique index if not exists exercises_user_name_idx
  on public.exercises (user_id, name);

create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  body_parts text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  position integer not null default 1
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date timestamptz not null default now(),
  body_parts text[] not null default '{}'
);

create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict
);

create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  exercise_log_id uuid not null references public.exercise_logs (id) on delete cascade,
  weight numeric not null,
  reps integer not null,
  set_number integer not null
);

create index if not exists workouts_user_id_date_idx on public.workouts (user_id, date desc);
create index if not exists exercise_logs_workout_id_idx on public.exercise_logs (workout_id);
create index if not exists sets_exercise_log_id_idx on public.sets (exercise_log_id);
create index if not exists workout_plans_user_id_idx on public.workout_plans (user_id, created_at desc);
create index if not exists workout_plan_exercises_plan_id_idx on public.workout_plan_exercises (plan_id, position);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_plan_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.sets enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id);

drop policy if exists "Authenticated users can view exercises" on public.exercises;
create policy "Authenticated users can view exercises"
on public.exercises
for select
to authenticated
using (user_id is null or auth.uid() = user_id);

drop policy if exists "Users can insert own exercises" on public.exercises;
create policy "Users can insert own exercises"
on public.exercises
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own exercises" on public.exercises;
create policy "Users can update own exercises"
on public.exercises
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own exercises" on public.exercises;
create policy "Users can delete own exercises"
on public.exercises
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can manage own workout plans" on public.workout_plans;
create policy "Users can manage own workout plans"
on public.workout_plans
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own workout plan exercises" on public.workout_plan_exercises;
create policy "Users can manage own workout plan exercises"
on public.workout_plan_exercises
for all
to authenticated
using (
  exists (
    select 1
    from public.workout_plans
    where workout_plans.id = workout_plan_exercises.plan_id
      and workout_plans.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workout_plans
    where workout_plans.id = workout_plan_exercises.plan_id
      and workout_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own workouts" on public.workouts;
create policy "Users can manage own workouts"
on public.workouts
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own exercise logs" on public.exercise_logs;
create policy "Users can manage own exercise logs"
on public.exercise_logs
for all
to authenticated
using (
  exists (
    select 1
    from public.workouts
    where workouts.id = exercise_logs.workout_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workouts
    where workouts.id = exercise_logs.workout_id
      and workouts.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own sets" on public.sets;
create policy "Users can manage own sets"
on public.sets
for all
to authenticated
using (
  exists (
    select 1
    from public.exercise_logs
    join public.workouts on workouts.id = exercise_logs.workout_id
    where exercise_logs.id = sets.exercise_log_id
      and workouts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.exercise_logs
    join public.workouts on workouts.id = exercise_logs.workout_id
    where exercise_logs.id = sets.exercise_log_id
      and workouts.user_id = auth.uid()
  )
);

create or replace function public.create_workout_with_sets(
  p_body_parts text[],
  p_payload jsonb,
  p_workout_date timestamptz default now()
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_workout_id uuid;
  v_log_id uuid;
  v_user_id uuid := auth.uid();
  v_exercise jsonb;
  v_set jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(array_length(p_body_parts, 1), 0) = 0 then
    raise exception 'At least one body part is required';
  end if;

  insert into public.workouts (user_id, date, body_parts)
  values (v_user_id, p_workout_date, p_body_parts)
  returning id into v_workout_id;

  for v_exercise in
    select value from jsonb_array_elements(p_payload)
  loop
    insert into public.exercise_logs (workout_id, exercise_id)
    values (v_workout_id, (v_exercise ->> 'exerciseId')::uuid)
    returning id into v_log_id;

    for v_set in
      select value from jsonb_array_elements(v_exercise -> 'sets')
    loop
      insert into public.sets (exercise_log_id, weight, reps, set_number)
      values (
        v_log_id,
        (v_set ->> 'weight')::numeric,
        (v_set ->> 'reps')::integer,
        (v_set ->> 'setNumber')::integer
      );
    end loop;
  end loop;

  return v_workout_id;
end;
$$;

grant execute on function public.create_workout_with_sets(text[], jsonb, timestamptz) to authenticated;
