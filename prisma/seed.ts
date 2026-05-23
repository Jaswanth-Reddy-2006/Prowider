import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear old data to prevent duplicates
  await prisma.webhookEvent.deleteMany()
  await prisma.leadAssignment.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.provider.deleteMany()
  await prisma.allocationState.deleteMany()
  await prisma.service.deleteMany()

  // Services
  await prisma.service.createMany({
    data: [
      { id: 1, name: 'Service 1' },
      { id: 2, name: 'Service 2' },
      { id: 3, name: 'Service 3' },
    ],
  })

  // Providers – 8 total, each monthlyQuota 10
  await prisma.provider.createMany({
    data: [
      { id: 1, name: 'Provider 1', isMandatory: true, monthlyQuota: 10, remainingQuota: 10 },
      { id: 2, name: 'Provider 2', isMandatory: false, monthlyQuota: 10, remainingQuota: 10 },
      { id: 3, name: 'Provider 3', isMandatory: false, monthlyQuota: 10, remainingQuota: 10 },
      { id: 4, name: 'Provider 4', isMandatory: true, monthlyQuota: 10, remainingQuota: 10 },
      { id: 5, name: 'Provider 5', isMandatory: true, monthlyQuota: 10, remainingQuota: 10 },
      { id: 6, name: 'Provider 6', isMandatory: false, monthlyQuota: 10, remainingQuota: 10 },
      { id: 7, name: 'Provider 7', isMandatory: false, monthlyQuota: 10, remainingQuota: 10 },
      { id: 8, name: 'Provider 8', isMandatory: false, monthlyQuota: 10, remainingQuota: 10 },
    ],
  })

  // Initialise allocation state for each service
  const services = await prisma.service.findMany()
  for (const srv of services) {
    await prisma.allocationState.create({
      data: { serviceId: srv.id, lastAssignedProviderIdx: 0 },
    })
  }

  console.log("Database seeded successfully with dummy data.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
