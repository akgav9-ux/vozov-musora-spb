alter table public.orders
add column if not exists details text;

comment on column public.orders.details is
'Подробное описание того, что клиенту нужно вывезти: предметы, количество, этаж, лифт и другие особенности.';
