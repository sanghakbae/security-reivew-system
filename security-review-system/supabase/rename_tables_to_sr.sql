do $$
begin
  if to_regclass('public.profiles') is not null and to_regclass('public.sr_profiles') is null then
    alter table public.profiles rename to sr_profiles;
  end if;

  if to_regclass('public.security_requirements') is not null and to_regclass('public.sr_security_requirements') is null then
    alter table public.security_requirements rename to sr_security_requirements;
  end if;

  if to_regclass('public.reviews') is not null and to_regclass('public.sr_reviews') is null then
    alter table public.reviews rename to sr_reviews;
  end if;

  if to_regclass('public.review_items') is not null and to_regclass('public.sr_review_items') is null then
    alter table public.review_items rename to sr_review_items;
  end if;
end $$;
