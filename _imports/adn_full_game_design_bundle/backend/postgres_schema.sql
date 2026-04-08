-- ADN Tap-to-Earn economy schema (PostgreSQL)
create table if not exists player_level_config (
  level int primary key,
  xp_to_next int not null,
  cumulative_xp int not null,
  tap_reward numeric(18,2) not null,
  max_energy int not null,
  regen_per_min int not null,
  offline_cap_hours numeric(8,2) not null,
  passive_cap_per_hour int not null,
  airdrop_weight_per_1000 numeric(10,2) not null
);

create table if not exists feature_unlock_config (
  id bigserial primary key,
  player_level int not null,
  feature_system text not null,
  purpose text,
  why_unlocks_here text,
  reward_direction text,
  abuse_risk_notes text,
  ops_notes text
);

create table if not exists upgrade_card_config (
  id text primary key,
  upgrade_name text not null,
  category text not null,
  unlock_level int not null,
  base_cost int not null,
  cost_growth numeric(10,4) not null,
  base_hourly_gain int not null,
  gain_growth numeric(10,4) not null,
  max_tier int not null,
  secondary_effect text,
  effect_per_tier text,
  design_notes text
);

create table if not exists upgrade_tier_config (
  id bigserial primary key,
  upgrade_id text not null references upgrade_card_config(id) on delete cascade,
  tier int not null,
  unlock_level int not null,
  cost_adn int not null,
  added_hourly_adn int not null,
  card_cumulative_adn_per_hr int not null,
  payback_hours numeric(10,2) not null,
  secondary_effect text,
  effect_per_tier text,
  phase text not null,
  efficiency_score numeric(12,2) not null,
  unique (upgrade_id, tier)
);

create table if not exists referral_quest_config (
  id bigserial primary key,
  chain_name text not null,
  stage int not null,
  unlock_level int not null,
  task text not null,
  requirement_detail text not null,
  reward_adn int not null,
  reward_weight int not null,
  bonus_reward text,
  completion_check text,
  anti_abuse_rule text,
  next_task_logic text,
  unique (chain_name, stage)
);

create table if not exists mission_engine_config (
  id bigserial primary key,
  player_segment text not null,
  primary_trigger text not null,
  recommended_next_quest text not null,
  reason text,
  reward_mix text,
  cooldown text,
  when_to_avoid text,
  notes text,
  ai_prompt_hint text
);

-- Runtime economy tables
create table if not exists user_progress (
  user_id text primary key,
  level int not null default 1,
  xp int not null default 0,
  adn_balance bigint not null default 0,
  hourly_adn bigint not null default 0,
  passive_unclaimed bigint not null default 0,
  last_active_at timestamptz,
  last_passive_calc_at timestamptz,
  referral_code text unique,
  referred_by_user_id text,
  suspicious_score int not null default 0,
  is_banned boolean not null default false
);

create table if not exists user_upgrade_levels (
  user_id text not null,
  upgrade_id text not null references upgrade_card_config(id),
  current_tier int not null default 0,
  last_purchased_at timestamptz,
  primary key (user_id, upgrade_id)
);

create table if not exists user_referral_quest_progress (
  user_id text not null,
  chain_name text not null,
  stage int not null,
  status text not null default 'locked',
  progress_value numeric(18,2) not null default 0,
  assigned_at timestamptz,
  completed_at timestamptz,
  reward_claimed_at timestamptz,
  primary key (user_id, chain_name, stage)
);

create table if not exists user_dynamic_tasks (
  id bigserial primary key,
  user_id text not null,
  player_segment text,
  title text not null,
  description text not null,
  status text not null default 'active',
  reward_adn int not null default 0,
  reward_weight int not null default 0,
  reward_boost text,
  assigned_reason text,
  ai_prompt_version text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_user_progress_level on user_progress(level);
create index if not exists idx_user_progress_last_active on user_progress(last_active_at);
create index if not exists idx_user_tasks_status on user_dynamic_tasks(user_id, status);
