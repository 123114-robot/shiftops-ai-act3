# Business Rules

| ID | Rule | Error |
| --- | --- | --- |
| BR-01 | End must be after start | INVALID_SHIFT_TIME |
| BR-02 | Assigned shifts cannot overlap; adjacent is allowed | SHIFT_OVERLAP |
| BR-03 | Assignment must fit availability | AVAILABILITY_CONFLICT |
| BR-04 | Approved leave blocks assignment | EMPLOYEE_ON_LEAVE |
| BR-05 | Management actions require manager role | FORBIDDEN |
| BR-06 | Employees change only own availability | FORBIDDEN |
| BR-07 | Leave start cannot follow end | INVALID_LEAVE_RANGE |
| BR-08 | Inactive employees cannot receive shifts | EMPLOYEE_INACTIVE |
| BR-09 | Employee personal-data access is limited | FORBIDDEN |
| BR-10 | Deactivation preserves roster history | n/a |

Scheduling rules will exist once in SchedulingService.
