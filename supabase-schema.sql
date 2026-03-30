-- Crear tablas y polÃ­ticas para Sentinel SaaS
-- Copia y ejecuta en el editor SQL de Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE webapps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  video_url TEXT,
  price_info JSONB NOT NULL DEFAULT '{"mini":40,"start":50,"pro":70,"max":90}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  webapp_id UUID REFERENCES webapps(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('mini', 'start', 'pro', 'max')),
  status TEXT CHECK (status IN ('active', 'past_due', 'canceled')),
  stripe_subscription_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE webapp_admins (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  webapp_id UUID REFERENCES webapps(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, webapp_id)
);

CREATE TABLE condominios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE personal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN DEFAULT false,
  observations TEXT
);

CREATE TABLE prestamos_personal (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
  amount DECIMAL(10,2),
  remaining DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  status TEXT
);

CREATE TABLE transacciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominio_id UUID REFERENCES condominios(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE webapps ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webapp_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas bÃ¡sicas (ajustar segÃºn necesidad)
CREATE POLICY "Webapps public read" ON webapps FOR SELECT USING (true);
CREATE POLICY "Profile owner access" ON profiles FOR ALL USING (auth.uid() = id OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid()));
CREATE POLICY "Subscriptions owner access" ON subscriptions FOR ALL USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage webapp_admins" ON webapp_admins FOR ALL USING (EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid() AND webapp_id = webapp_admins.webapp_id));
CREATE POLICY "Condominios owner access" ON condominios FOR ALL USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid()));
CREATE POLICY "Personal access via condominio" ON personal FOR ALL USING (EXISTS (SELECT 1 FROM condominios WHERE condominios.id = personal.condominio_id AND (condominios.user_id = auth.uid() OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid()))));
CREATE POLICY "Asistencia access via personal" ON asistencia FOR ALL USING (EXISTS (SELECT 1 FROM personal WHERE personal.id = asistencia.personal_id AND EXISTS (SELECT 1 FROM condominios WHERE condominios.id = personal.condominio_id AND (condominios.user_id = auth.uid() OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid())))));
CREATE POLICY "Prestamos access via personal" ON prestamos_personal FOR ALL USING (EXISTS (SELECT 1 FROM personal WHERE personal.id = prestamos_personal.personal_id AND EXISTS (SELECT 1 FROM condominios WHERE condominios.id = personal.condominio_id AND (condominios.user_id = auth.uid() OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid())))));
CREATE POLICY "Transacciones access via condominio" ON transacciones FOR ALL USING (EXISTS (SELECT 1 FROM condominios WHERE condominios.id = transacciones.condominio_id AND (condominios.user_id = auth.uid() OR EXISTS (SELECT 1 FROM webapp_admins WHERE user_id = auth.uid()))));

-- Trigger para crear perfil al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS H:\......Z.proyectos\sentinel-saas\create-sentinel-saas.ps1
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
H:\......Z.proyectos\sentinel-saas\create-sentinel-saas.ps1 LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar webapps de ejemplo
INSERT INTO webapps (name, slug, description, video_url, price_info) VALUES
('Sentinel-Condominio', 'condominio', 'GestiÃ³n completa de condominios: personal, finanzas y reportes.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '{"mini":40,"start":50,"pro":70,"max":90}');
-- Puedes agregar mÃ¡s webapps aquÃ­
