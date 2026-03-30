'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const plans = [
  { name: 'Mini', limit: 3, price: 40 },
  { name: 'Start', limit: 5, price: 50 },
  { name: 'Pro', limit: 12, price: 70 },
  { name: 'Max', limit: 'Ilimitado', price: 90 }
]

export function PlanLimits({ currentPlan }: { currentPlan: string }) {
  const [show, setShow] = useState(false)

  return (
    <div className="mt-8">
      <button
        onClick={() => setShow(!show)}
        className="text-sm text-blue-600 hover:underline focus:outline-none"
      >
        Â¿Necesita gestionar mÃ¡s condominios?
      </button>
      {show && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={currentPlan === plan.name.toLowerCase() ? 'border-blue-500' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Capacidad: {plan.limit}</p>
                <p className="text-xl font-bold mt-2">S/ {plan.price} / mes</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
