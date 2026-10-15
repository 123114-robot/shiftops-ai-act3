import cors from 'cors';
import express from 'express';
import { PrismaAuthUserRepository } from './repositories/AuthUserRepository.js';
import { PrismaAvailabilityRepository } from './repositories/AvailabilityRepository.js';
import { PrismaEmployeeRepository } from './repositories/EmployeeRepository.js';
import { PrismaShiftRepository } from './repositories/ShiftRepository.js';
import { PrismaSchedulingRepository } from './repositories/SchedulingRepository.js';
import { PrismaLeaveRepository } from './repositories/LeaveRepository.js';
import { PrismaRosterRepository } from './repositories/RosterRepository.js';
import { PrismaDashboardRepository } from './repositories/DashboardRepository.js';
import { createAvailabilityRouter, createManagerAvailabilityRouter } from './routes/availability.js';
import { createAuthRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { shiftOpsHealthRouter } from './routes/shiftops-health.js';
import { createEmployeeRouter } from './routes/employees.js';
import { createShiftRouter } from './routes/shifts.js';
import { createLeaveRouter } from './routes/leave.js';
import { createRosterRouter } from './routes/roster.js';
import { createDashboardRouter } from './routes/dashboard.js';
import { createShiftOpsProposalRouter } from './routes/shiftops-proposals.js';
import { AuthenticationService } from './services/AuthenticationService.js';
import { AvailabilityService } from './services/AvailabilityService.js';
import { EmployeeService } from './services/EmployeeService.js';
import { ShiftService } from './services/ShiftService.js';
import { SchedulingService } from './services/SchedulingService.js';
import { LeaveService } from './services/LeaveService.js';
import { RosterService } from './services/RosterService.js';
import { DashboardService } from './services/DashboardService.js';
import { ShiftOpsEligibilityService } from './shiftops/ShiftOpsEligibilityService.js';
import { PrismaShiftOpsRepository } from './shiftops/PrismaShiftOpsRepository.js';
import { ShiftOpsProposalService } from './shiftops/ShiftOpsProposalService.js';
import { PrismaProposalRepository } from './shiftops/PrismaProposalRepository.js';
import {
  DeterministicExplanationProvider,
  GroundedExplanationProvider,
  OpenAICompatibleExplanationProvider,
  AMD_TOKEN_FACTORY_BASE_URL,
} from './shiftops/ShiftOpsExplanationProvider.js';

const jwtSecret = process.env.JWT_SECRET ?? 'development-only-secret-change-me-now';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production.');
}
const authenticationService = new AuthenticationService(new PrismaAuthUserRepository(), jwtSecret);
const employeeService = new EmployeeService(new PrismaEmployeeRepository());
const availabilityService = new AvailabilityService(new PrismaAvailabilityRepository());
const schedulingService = new SchedulingService(new PrismaSchedulingRepository());
const shiftService = new ShiftService(new PrismaShiftRepository(), schedulingService);
const leaveService = new LeaveService(new PrismaLeaveRepository());
const rosterService = new RosterService(new PrismaRosterRepository());
const dashboardService = new DashboardService(new PrismaDashboardRepository());
const maxWeeklyMinutes = Number(process.env.SHIFTOPS_MAX_WEEKLY_MINUTES ?? '2400');
const eligibilityService = new ShiftOpsEligibilityService(new PrismaShiftOpsRepository(), {
  maxWeeklyMinutes,
  requireRoleMatch: process.env.SHIFTOPS_REQUIRE_ROLE_MATCH !== 'false',
});
const deterministicExplanation = new DeterministicExplanationProvider();
const aiMode = process.env.AI_MODE ?? 'deterministic';
const configuredAiProvider = process.env.AI_PROVIDER ?? 'openai-compatible';
if (!['deterministic', 'remote'].includes(aiMode)) {
  throw new Error('AI_MODE must be deterministic or remote.');
}
if (configuredAiProvider !== 'openai-compatible' && configuredAiProvider !== 'amd-token-factory') {
  throw new Error('AI_PROVIDER must be openai-compatible or amd-token-factory.');
}
const aiProvider = configuredAiProvider;
const explanationProvider = aiMode === 'remote'
  ? new GroundedExplanationProvider(
    new OpenAICompatibleExplanationProvider({
      baseUrl: aiProvider === 'amd-token-factory'
        ? process.env.AI_BASE_URL || AMD_TOKEN_FACTORY_BASE_URL
        : process.env.AI_BASE_URL ?? '',
      apiKey: process.env.AI_API_KEY ?? '',
      model: process.env.AI_MODEL ?? '',
      timeoutMs: Number(process.env.AI_TIMEOUT_SECONDS ?? '30') * 1_000,
      provider: aiProvider,
      supportsResponseFormat: aiProvider !== 'amd-token-factory',
    }),
    new DeterministicExplanationProvider('deterministic-fallback'),
    trace => console.info('shiftops_ai_inference', JSON.stringify(trace)),
  )
  : deterministicExplanation;
const proposalService = new ShiftOpsProposalService(
  new PrismaProposalRepository({
    maxWeeklyMinutes,
    requireRoleMatch: process.env.SHIFTOPS_REQUIRE_ROLE_MATCH !== 'false',
  }),
  eligibilityService,
  explanationProvider,
);

export const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api/shiftops/health', shiftOpsHealthRouter);
app.use('/api/shiftops', createShiftOpsProposalRouter(authenticationService, proposalService));
app.use('/api/auth', createAuthRouter(authenticationService));
app.use('/api/employees', createEmployeeRouter(authenticationService, employeeService));
app.use('/api/employees', createManagerAvailabilityRouter(authenticationService, availabilityService));
app.use('/api/availability', createAvailabilityRouter(authenticationService, availabilityService));
app.use('/api/shifts', createShiftRouter(authenticationService, shiftService));
app.use('/api/leave-requests', createLeaveRouter(authenticationService, leaveService));
app.use('/api/roster', createRosterRouter(authenticationService, rosterService));
app.use('/api/dashboard', createDashboardRouter(authenticationService, dashboardService));
