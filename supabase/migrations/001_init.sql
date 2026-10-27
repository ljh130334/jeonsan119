-- 전산119 초기 스키마 (src/types/index.ts와 1:1)

create type user_role as enum ('employee', 'admin');
create type ticket_category as enum ('network', 'hardware', 'software', 'account', 'etc');
create type ticket_priority as enum ('urgent', 'normal');
create type ticket_status as enum ('open', 'in_progress', 'done');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  department text,
  role user_role not null default 'employee'
);

create table tickets (
  id bigint generated always as identity primary key,
  title text not null check (char_length(title) <= 30),
  description text not null,
  category ticket_category not null,
  priority ticket_priority not null default 'normal',
  status ticket_status not null default 'open',
  requester_id uuid not null references profiles (id),
  assignee_id uuid references profiles (id),
  ai_summary text,
  chat_log jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  resolved_at timestamptz
);

create index tickets_status_idx on tickets (status);
create index tickets_requester_idx on tickets (requester_id);

create table ticket_notes (
  id bigint generated always as identity primary key,
  ticket_id bigint not null references tickets (id) on delete cascade,
  author_id uuid not null references profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table faqs (
  id bigint generated always as identity primary key,
  category ticket_category not null,
  question text not null,
  answer text not null,
  keywords text[] not null default '{}'
);

-- 상태 변경 시 updated_at / started_at / resolved_at 자동 기록
create function set_ticket_timestamps() returns trigger as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    if new.status = 'in_progress' and new.started_at is null then
      new.started_at := now();
    end if;
    if new.status = 'done' then
      new.resolved_at := now();
    else
      new.resolved_at := null;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tickets_set_timestamps
before update on tickets
for each row execute function set_ticket_timestamps();
