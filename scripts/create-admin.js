const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator'
      }
    })
    
    console.log('Admin created successfully:', admin)
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Admin already exists')
    } else {
      console.error('Error creating admin:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()


































