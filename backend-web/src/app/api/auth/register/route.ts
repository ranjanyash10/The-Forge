import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json()

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password_hash,
        current_title: 'Wanderer',
      }
    })

    // Give new user the Wanderer title
    try {
      await prisma.userTitle.create({
        data: {
          user_id: user.id,
          title_id: 'Wanderer'
        }
      })
    } catch {
      // Title may not exist if seed hasn't run — that's ok
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      username: user.username,
    })
  } catch (error: any) {
    console.error('Registration Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
