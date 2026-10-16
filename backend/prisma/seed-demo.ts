import {
  DayOfWeek,
  EmployeeStatus,
  LeaveStatus,
  PrismaClient,
  ShiftStatus,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const demoShiftId = 'demo-shift-incident';
const demoLeaveId = 'demo-leave-request';
const demoShiftMarker = '[DEMO] Incident workflow shift';

function dateOnly(daysFromToday: number) {
  const value = new Date();
  value.setUTCHours(12, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() + daysFromToday);
  return value;
}

async function upsertEmployee(
  passwordHash: string,
  input: { firstName: string; lastName: string; email: string; jobTitle: string },
) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: { email: input.email, passwordHash, role: UserRole.EMPLOYEE },
  });
  return prisma.employee.upsert({
    where: { email: input.email },
    update: {},
    create: { ...input, status: EmployeeStatus.ACTIVE, userId: user.id },
  });
}

async function main() {
  if (process.env.DEMO_SEED_ENABLED !== 'true') {
    throw new Error('Demo seed refused: set DEMO_SEED_ENABLED=true for a synthetic demo database.');
  }
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword || demoPassword.length < 12) {
    throw new Error('Demo seed refused: DEMO_PASSWORD must contain at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@shiftflow.local' },
    update: {},
    create: { email: 'manager@shiftflow.local', passwordHash, role: UserRole.MANAGER },
  });

  const [barry, casey, alice, james] = await Promise.all([
    upsertEmployee(passwordHash, { firstName: 'Barry', lastName: 'Nguyen', email: 'barry@shiftflow.local', jobTitle: 'Chef' }),
    upsertEmployee(passwordHash, { firstName: 'Casey', lastName: 'Lee', email: 'casey@shiftflow.local', jobTitle: 'Chef' }),
    upsertEmployee(passwordHash, { firstName: 'Alice', lastName: 'Morgan', email: 'alice@shiftflow.local', jobTitle: 'Supervisor' }),
    upsertEmployee(passwordHash, { firstName: 'James', lastName: 'Patel', email: 'james@shiftflow.local', jobTitle: 'Team Member' }),
  ]);

  const days = Object.values(DayOfWeek);
  for (const employee of [barry, casey, alice, james]) {
    for (const dayOfWeek of days) {
      await prisma.availability.upsert({
        where: { employeeId_dayOfWeek: { employeeId: employee.id, dayOfWeek } },
        update: {},
        create: { employeeId: employee.id, dayOfWeek, startTime: '08:00', endTime: '20:00', isAvailable: true },
      });
    }
  }

  await prisma.shift.upsert({
    where: { id: demoShiftId },
    update: {},
    create: {
      id: demoShiftId,
      employeeId: barry.id,
      date: dateOnly(0),
      startTime: '10:00',
      endTime: '18:00',
      role: 'Chef',
      notes: demoShiftMarker,
      status: ShiftStatus.SCHEDULED,
      createdById: manager.id,
    },
  });

  const leaveMarker = '[DEMO] Personal leave';
  await prisma.leaveRequest.upsert({
    where: { id: demoLeaveId },
    update: {},
    create: {
      id: demoLeaveId,
      employeeId: james.id,
      startDate: dateOnly(5),
      endDate: dateOnly(6),
      reason: leaveMarker,
      status: LeaveStatus.PENDING,
    },
  });

  console.info('Synthetic ShiftOps demo data is ready. No existing records were deleted.');
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : 'Demo seed failed.');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
