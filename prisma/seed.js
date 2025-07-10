const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local')
    process.exit(1)
  }
  
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
  } else {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    
    // Create admin user
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword
      }
    })
    console.log('✅ Admin user created successfully')
  }

  // Create ticket types
  const existingSoloVibes = await prisma.ticketType.findFirst({
    where: { name: 'Solo Vibes' }
  })

  let soloVibes
  if (existingSoloVibes) {
    console.log('✅ Solo Vibes ticket type already exists')
    soloVibes = existingSoloVibes
  } else {
    soloVibes = await prisma.ticketType.create({
      data: {
        name: 'Solo Vibes',
        price: 15000, // ₦15,000
        description: 'Single entry ticket for solo party-goers',
        isActive: true
      }
    })
    console.log('✅ Solo Vibes ticket type created')
  }

  const existingGengEnergy = await prisma.ticketType.findFirst({
    where: { name: 'Geng Energy' }
  })

  let gengEnergy
  if (existingGengEnergy) {
    console.log('✅ Geng Energy ticket type already exists')
    gengEnergy = existingGengEnergy
  } else {
    gengEnergy = await prisma.ticketType.create({
      data: {
        name: 'Geng Energy',
        price: 25000, // ₦25,000
        description: 'Group ticket for the squad',
        isActive: true
      }
    })
    console.log('✅ Geng Energy ticket type created')
  }

  console.log('✅ Ticket types seeded:', { soloVibes, gengEnergy })
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 