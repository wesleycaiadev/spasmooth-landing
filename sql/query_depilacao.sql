SELECT 
  slug, name, description, price, duration_minutes, active, category
FROM services 
WHERE slug IN (
  'depilacao-meia-perna',
  'depilacao-perna-completa',
  'depilacao-bracos',
  'depilacao-costas',
  'depilacao-abdomen',
  'depilacao-intima',
  'depilacao-corpo-todo'
);
