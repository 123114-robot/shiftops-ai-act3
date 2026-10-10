# System Architecture

React UI → REST API → Routes → Controllers → Services → Repositories/Prisma → PostgreSQL.

Routes map HTTP concerns. Controllers translate requests and responses. Services own workflows and business rules. Repositories isolate persistence when useful. Prisma defines relations. The frontend communicates only through /api. SchedulingService will be the single assignment-policy boundary.
