-- Replace the active goods-trade interest choice with the online forex concept.
-- Keep the former value allowed so existing user preferences remain valid and editable.
alter table public.user_preferences
  drop constraint if exists user_preferences_topics_allowed;

alter table public.user_preferences
  add constraint user_preferences_topics_allowed check (
    array_position(help_topics, null) is null and
    help_topics <@ array[
      'digital_tools', 'online_presence', 'business_training',
      'computing_classes', 'online_forex_trading', 'responsible_goods_trade', 'other'
    ]::text[]
  );
