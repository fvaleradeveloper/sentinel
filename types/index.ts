export interface Webapp {
  id: string
  name: string
  slug: string
  description: string
  video_url: string
  price_info: Record<string, number>
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  theme: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  webapp_id: string
  plan: 'mini' | 'start' | 'pro' | 'max'
  status: 'active' | 'past_due' | 'canceled'
  stripe_subscription_id: string | null
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface Condominio {
  id: string
  user_id: string
  name: string
  address: string
  created_at: string
}

export interface Personal {
  id: string
  condominio_id: string
  name: string
  role: string
  phone: string
  created_at: string
}

export interface Transaccion {
  id: string
  condominio_id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  description: string
  receipt_url: string
  created_at: string
}
