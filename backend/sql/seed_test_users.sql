-- Test kullanicilari (sadece development ortamı için)
INSERT INTO users (email, password, name, surname, is_approved) VALUES
  ('test@example.com',    '$2a$10$Tw0SATfJEnXtHw3ujIC3IeM8AuI.HB2J5vChfYeho/LMRHHWc9toO', 'Test',   'Kullanici', true),
  ('admin@example.com',   '$2a$10$nNuglEip4FckL3m8hRMy7eyC5Ks71upDhXfo79YVYIcnax41kXkFe', 'Admin',  'Kullanici', true),
  ('pending@example.com', '$2a$10$7a5.mb0.nVYO1E4w4zpXrO1ndKh0OxjmoFwIaNaq9p454k.sDgjzK', 'Onaysiz','Kullanici', false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
  SELECT u.id, r.id FROM users u, roles r
  WHERE u.email = 'test@example.com' AND r.name = 'User'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
  SELECT u.id, r.id FROM users u, roles r
  WHERE u.email = 'admin@example.com' AND r.name = 'Admin'
ON CONFLICT DO NOTHING;
