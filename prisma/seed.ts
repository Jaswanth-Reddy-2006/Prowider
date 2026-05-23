import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")
  
  // Clear existing
  await prisma.leadAssignment.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.allocationState.deleteMany()
  await prisma.service.deleteMany()
  await prisma.provider.deleteMany()
  await prisma.webhookEvent.deleteMany()

  // Create Services
  const s1 = await prisma.service.create({ data: { id: 1, name: "Service 1" } })
  const s2 = await prisma.service.create({ data: { id: 2, name: "Service 2" } })
  const s3 = await prisma.service.create({ data: { id: 3, name: "Service 3" } })

  // Initialize Allocation State
  await prisma.allocationState.create({ data: { serviceId: s1.id } })
  await prisma.allocationState.create({ data: { serviceId: s2.id } })
  await prisma.allocationState.create({ data: { serviceId: s3.id } })

  // Create Providers and link to Services
  const providersData = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Provider ${i + 1}`,
    monthlyQuota: 10,
    remainingQuota: 10
  }))

  for (const p of providersData) {
    const serviceConnections = []
    
    // Service 1: Providers 1 (mandatory), 2,3,4
    if ([1, 2, 3, 4].includes(p.id)) {
      serviceConnections.push({ id: s1.id })
    }
    // Service 2: Providers 5 (mandatory), 6,7,8
    if ([5, 6, 7, 8].includes(p.id)) {
      serviceConnections.push({ id: s2.id })
    }
    // Service 3: Providers 1, 4 (mandatory), 2,3,5,6,7,8 (All)
    serviceConnections.push({ id: s3.id })

    await prisma.provider.create({
      data: {
        id: p.id,
        name: p.name,
        monthlyQuota: p.monthlyQuota,
        remainingQuota: p.remainingQuota,
        services: {
          connect: serviceConnections
        }
      }
    })
  }

  console.log("Seeding completed successfully.")
}

main()
  .catch(e => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
