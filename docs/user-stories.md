# User Stories

As a user, I want to log in and see only permitted pages, so workforce data is protected. Given an employee calls a manager endpoint, return FORBIDDEN.

As a manager, I want to deactivate employees without deleting history. Given an employee has shifts, deactivation keeps those shifts queryable.

As a manager, I want availability checked during assignment. Given 09:00–17:00 availability, assigning 18:00–22:00 returns AVAILABILITY_CONFLICT.

As an employee, I want to change only my availability. Employee A changing Employee B returns FORBIDDEN.

As an employee, I want to request leave and see its status. As a manager, I want approved leave checked; a covered shift date returns EMPLOYEE_ON_LEAVE.

As a manager, I want a weekly roster with coverage and unassigned shifts. As an employee, I want my schedule without unrelated private data.
