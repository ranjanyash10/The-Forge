import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
    }

    // Check if user has a password (legacy demo users may not)
    if (!user.password_hash) {
      return NextResponse.json({ error: 'This account uses demo mode. Please register a new account.' }, { status: 400 })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      username: user.username,
    })
  } catch (error: any) {
    console.error('Login Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
