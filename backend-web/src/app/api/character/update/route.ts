import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      userId = 'demo-user-id',
      name,
      avatarUrl,
      weight,
      height,
      fitnessGoals,
      executionBase,
      adaptabilityBase,
      resilienceBase,
      selfAwarenessBase,
      egoResistanceBase
    } = body

    const existingChar = await prisma.character.findUnique({
      where: { user_id: userId }
    })

    if (!existingChar) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl
    if (weight !== undefined) updateData.weight = weight
    if (height !== undefined) updateData.height = height
    if (fitnessGoals !== undefined) updateData.fitness_goals = fitnessGoals

    if (executionBase !== undefined) {
      updateData.execution_base = executionBase
      updateData.execution_lvl = executionBase
    }
    if (adaptabilityBase !== undefined) {
      updateData.adaptability_base = adaptabilityBase
      updateData.adaptability_lvl = adaptabilityBase
    }
    if (resilienceBase !== undefined) {
      updateData.resilience_base = resilienceBase
      updateData.resilience_lvl = resilienceBase
    }
    if (selfAwarenessBase !== undefined) {
      updateData.self_awareness_base = selfAwarenessBase
      updateData.self_awareness_lvl = selfAwarenessBase
    }
    if (egoResistanceBase !== undefined) {
      updateData.ego_resistance_base = egoResistanceBase
      updateData.ego_resistance_lvl = egoResistanceBase
    }

    const updatedChar = await prisma.character.update({
      where: { user_id: userId },
      data: updateData
    })

    return NextResponse.json({ success: true, character: updatedChar })
  } catch (error: any) {
    console.error('Character Update Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
