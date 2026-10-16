import { cleanup,fireEvent,render,screen,within } from '@testing-library/react';
import { afterEach,describe,expect,it,vi } from 'vitest';
import App from '../src/App';
const manager={id:'m',email:'manager@shiftflow.local',role:'MANAGER',employeeId:null};
const employeeUser={id:'u',email:'barry@shiftflow.local',role:'EMPLOYEE',employeeId:'e1'};
const barry={id:'e1',firstName:'Barry',lastName:'Nguyen',email:'barry@shiftflow.local',phone:'0400000000',jobTitle:'Chef',status:'ACTIVE',createdAt:'2026-09-20T00:00:00.000Z'};
const response=(body:unknown,status=200)=>Promise.resolve(new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}}));
afterEach(()=>{cleanup();localStorage.clear();window.history.pushState({},'','/');vi.restoreAllMocks();});

describe('authentication restoration',()=>{
  it('restores a valid token through auth/me',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/dashboard');vi.spyOn(globalThis,'fetch').mockImplementation(()=>response({user:manager}));render(<App/>);expect(screen.getByText('Restoring session…')).toBeInTheDocument();expect(await screen.findByRole('heading',{name:'Manager dashboard'})).toBeInTheDocument();});
  it('clears an invalid token and redirects to login',async()=>{localStorage.setItem('shiftflow_token','expired');window.history.pushState({},'','/dashboard');vi.spyOn(globalThis,'fetch').mockImplementation(()=>response({error:{}},401));render(<App/>);expect(await screen.findByRole('heading',{name:'Welcome back'})).toBeInTheDocument();expect(localStorage.getItem('shiftflow_token')).toBeNull();});
  it('sends an employee directly to my schedule',async()=>{vi.spyOn(globalThis,'fetch').mockImplementation(()=>response({token:'token',user:employeeUser}));render(<App/>);fireEvent.change(screen.getByLabelText('Email'),{target:{value:employeeUser.email}});fireEvent.change(screen.getByLabelText('Password'),{target:{value:'ShiftFlow123!'}});fireEvent.click(screen.getByRole('button',{name:'Sign in'}));expect(await screen.findByRole('heading',{name:'My schedule'})).toBeInTheDocument();expect(window.location.pathname).toBe('/my-schedule');});
});

describe('employee UI',()=>{
  function managerSession(){localStorage.setItem('shiftflow_token','valid');vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{const url=String(input);if(url.endsWith('/auth/me'))return response({user:manager});if(init?.method==='PATCH')return response({employee:{...barry,jobTitle:'Head Chef'}});if(init?.method==='DELETE')return response({employee:{...barry,status:'INACTIVE'}});return response({employee:barry,employees:[barry]});});}
  it('loads employee details',async()=>{managerSession();window.history.pushState({},'','/employees/e1');render(<App/>);expect(await screen.findByRole('heading',{name:'Barry Nguyen'})).toBeInTheDocument();expect(screen.getByText('0400000000')).toBeInTheDocument();});
  it('updates employee details',async()=>{managerSession();window.history.pushState({},'','/employees/e1');render(<App/>);await screen.findByRole('heading',{name:'Barry Nguyen'});fireEvent.click(screen.getByRole('button',{name:'Edit Employee'}));fireEvent.change(screen.getByLabelText(/job title/i),{target:{value:'Head Chef'}});fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));expect(await screen.findByText('Employee updated successfully.')).toBeInTheDocument();expect(screen.getByText('Head Chef')).toBeInTheDocument();});
  it('confirms deactivation and keeps the profile visible',async()=>{managerSession();window.history.pushState({},'','/employees/e1');render(<App/>);await screen.findByRole('heading',{name:'Barry Nguyen'});fireEvent.click(screen.getByRole('button',{name:'Deactivate Employee'}));const dialog=screen.getByRole('dialog',{name:'Deactivate this employee?'});expect(within(dialog).getByText(/no longer be eligible/i)).toBeInTheDocument();fireEvent.click(within(dialog).getByRole('button',{name:'Confirm Deactivation'}));expect(await screen.findByText('Employee deactivated successfully.')).toBeInTheDocument();expect(screen.getAllByText('INACTIVE').length).toBeGreaterThan(0);});
  it('reactivates the existing employee record',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/employees/e1');vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{const url=String(input);if(url.endsWith('/auth/me'))return response({user:manager});if(init?.method==='PATCH')return response({employee:{...barry,status:'ACTIVE'}});return response({employee:{...barry,status:'INACTIVE'}});});render(<App/>);await screen.findByRole('heading',{name:'Barry Nguyen'});fireEvent.click(screen.getByRole('button',{name:'Reactivate Employee'}));expect(await screen.findByText('Employee reactivated successfully.')).toBeInTheDocument();expect(screen.getAllByText('ACTIVE').length).toBeGreaterThan(0);});
  it('does not allow an employee into manager pages',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/employees');vi.spyOn(globalThis,'fetch').mockImplementation(()=>response({user:employeeUser}));render(<App/>);expect(await screen.findByRole('heading',{name:'My schedule'})).toBeInTheDocument();});
});

describe('availability UI',()=>{
  const week=[
    {id:'a1',employeeId:'e1',dayOfWeek:'MONDAY',startTime:'09:00',endTime:'17:00',isAvailable:true},
    {id:'a2',employeeId:'e1',dayOfWeek:'TUESDAY',startTime:null,endTime:null,isAvailable:false},
  ];
  it('lets an employee view and save their recurring availability',async()=>{
    localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/availability');
    vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{
      const url=String(input);if(url.endsWith('/auth/me'))return response({user:employeeUser});
      if(init?.method==='PUT')return response({availability:week});
      return response({availability:week});
    });
    render(<App/>);
    expect(await screen.findByRole('heading',{name:'My availability'})).toBeInTheDocument();
    expect(await screen.findByLabelText('Monday start time')).toHaveValue('09:00');
    fireEvent.click(screen.getByRole('button',{name:'Save availability'}));
    expect(await screen.findByText('Availability saved successfully.')).toBeInTheDocument();
  });
  it('shows employee availability read-only to a manager',async()=>{
    localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/employees/e1/availability');
    vi.spyOn(globalThis,'fetch').mockImplementation((input)=>String(input).endsWith('/auth/me')?response({user:manager}):response({availability:week}));
    render(<App/>);
    expect(await screen.findByRole('heading',{name:'Employee availability'})).toBeInTheDocument();
    expect((await screen.findAllByText('09:00–17:00')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button',{name:'Save availability'})).not.toBeInTheDocument();
  });
});

describe('shift UI',()=>{
  const shift={id:'s1',employeeId:null,date:'2026-10-01T00:00:00.000Z',startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'DRAFT',createdById:'m',createdAt:'',updatedAt:''};
  it('lets a manager list, create, edit, and cancel shifts',async()=>{
    localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/shifts');
    vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{const url=String(input);if(url.endsWith('/auth/me'))return response({user:manager});if(init?.method==='POST')return response({shift:{...shift,id:'s2',role:'Supervisor'}},201);if(init?.method==='PATCH')return response({shift:{...shift,role:'Head Chef'}});if(init?.method==='DELETE')return response({shift:{...shift,status:'CANCELLED'}});return response({shifts:[shift]});});
    render(<App/>);expect(await screen.findByRole('heading',{name:'Shifts'})).toBeInTheDocument();expect((await screen.findAllByText('Chef')).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(/Required role/),{target:{value:'Supervisor'}});fireEvent.click(screen.getByRole('button',{name:'Create Shift'}));expect(await screen.findByText('Shift created successfully.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button',{name:'Edit Shift'})[0]!);fireEvent.change(screen.getByLabelText(/Required role/),{target:{value:'Head Chef'}});fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));expect(await screen.findByText('Shift updated successfully.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button',{name:'Cancel Shift'})[0]!);const dialog=screen.getByRole('dialog',{name:'Cancel this shift?'});fireEvent.click(within(dialog).getByRole('button',{name:'Confirm Cancellation'}));expect(await screen.findByText('Shift cancelled successfully.')).toBeInTheDocument();
  });
});

describe('leave UI',()=>{
  const leave={id:'l1',employeeId:'e1',startDate:'2026-10-10T00:00:00.000Z',endDate:'2026-10-11T00:00:00.000Z',reason:'Holiday',status:'PENDING',reviewedById:null,reviewedAt:null,createdAt:'',updatedAt:''};
  it('lets an employee submit and view leave status',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/my-leave');vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>String(input).endsWith('/auth/me')?response({user:employeeUser}):init?.method==='POST'?response({leaveRequest:{...leave,id:'l2'}},201):response({leaveRequests:[leave]}));render(<App/>);expect(await screen.findByRole('heading',{name:'My leave'})).toBeInTheDocument();expect(await screen.findByText('Holiday')).toBeInTheDocument();fireEvent.change(screen.getByLabelText(/Start date/),{target:{value:'2026-10-10'}});fireEvent.change(screen.getByLabelText(/End date/),{target:{value:'2026-10-11'}});fireEvent.change(screen.getByLabelText(/Reason/),{target:{value:'Holiday'}});fireEvent.click(screen.getByRole('button',{name:'Submit leave request'}));expect(await screen.findByText('Leave request submitted successfully.')).toBeInTheDocument();});
  it('lets a manager approve a pending request',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/leave-requests');vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>String(input).endsWith('/auth/me')?response({user:manager}):init?.method==='PATCH'?response({leaveRequest:{...leave,status:'APPROVED'}}):response({leaveRequests:[leave]}));render(<App/>);expect(await screen.findByRole('heading',{name:'Leave requests'})).toBeInTheDocument();fireEvent.click(await screen.findByRole('button',{name:'Approve'}));expect(await screen.findByText('Leave request approved.')).toBeInTheDocument();expect(screen.getByText('APPROVED')).toBeInTheDocument();});
});

describe('weekly roster UI',()=>{
  const shift={id:'s1',employeeId:'e1',date:'2026-10-05T00:00:00.000Z',startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'SCHEDULED',createdById:'m',createdAt:'',updatedAt:''};
  it('shows the full weekly roster to managers',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/roster');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:manager}):response({shifts:[shift]}));render(<App/>);expect(await screen.findByRole('heading',{name:'Weekly roster'})).toBeInTheDocument();expect((await screen.findAllByText('Chef')).length).toBeGreaterThan(0);expect(screen.getAllByText('e1').length).toBeGreaterThan(0);});
  it('shows an employee personal weekly schedule',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/my-roster');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:employeeUser}):response({shifts:[shift]}));render(<App/>);expect(await screen.findByRole('heading',{name:'My weekly schedule'})).toBeInTheDocument();expect((await screen.findAllByText('09:00–17:00')).length).toBeGreaterThan(0);});
  it('supports manager custom ranges and rejects an inverted range',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/roster');const fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:manager}):response({shifts:[shift]}));render(<App/>);await screen.findByRole('heading',{name:'Weekly roster'});fireEvent.change(screen.getByLabelText('Period'),{target:{value:'custom'}});fireEvent.change(screen.getByLabelText('Start date'),{target:{value:'2026-10-10'}});fireEvent.change(screen.getByLabelText('End date'),{target:{value:'2026-10-01'}});fireEvent.click(screen.getByRole('button',{name:'Search roster'}));expect(screen.getByRole('alert')).toHaveTextContent('End date must be on or after start date.');fireEvent.change(screen.getByLabelText('End date'),{target:{value:'2026-10-12'}});fireEvent.click(screen.getByRole('button',{name:'Search roster'}));expect((await screen.findAllByText('Chef')).length).toBeGreaterThan(0);expect(fetchMock.mock.calls.some(([input])=>String(input).includes('/shifts?startDate=2026-10-10&endDate=2026-10-12'))).toBe(true);});
});

describe('theme and navigation',()=>{
  it('uses the system colour preference when no manual theme exists',async()=>{Object.defineProperty(window,'matchMedia',{configurable:true,value:vi.fn().mockReturnValue({matches:true})});window.history.pushState({},'','/login');render(<App/>);expect(await screen.findByRole('heading',{name:'Welcome back'})).toBeInTheDocument();expect(document.documentElement.dataset.theme).toBe('dark');});
  it('persists a manual theme selection',async()=>{Object.defineProperty(window,'matchMedia',{configurable:true,value:vi.fn().mockReturnValue({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})});localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/dashboard');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:manager}):response({dashboard:{employeesWorkingToday:0,unfilledShifts:0,employeesOnLeave:0,totalScheduledHours:0}}));render(<App/>);const toggle=await screen.findByRole('button',{name:'Switch to dark mode'});fireEvent.click(toggle);expect(document.documentElement.dataset.theme).toBe('dark');expect(localStorage.getItem('shiftops_theme')).toBe('dark');});
  it('restores a saved theme instead of the system preference',async()=>{Object.defineProperty(window,'matchMedia',{configurable:true,value:vi.fn().mockReturnValue({matches:false})});localStorage.setItem('shiftops_theme','dark');window.history.pushState({},'','/login');render(<App/>);expect(await screen.findByRole('heading',{name:'Welcome back'})).toBeInTheDocument();expect(document.documentElement.dataset.theme).toBe('dark');});
  it('shows only employee navigation to employees',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/my-schedule');vi.spyOn(globalThis,'fetch').mockImplementation(()=>response({user:employeeUser}));render(<App/>);expect(await screen.findByRole('navigation',{name:'Primary navigation'})).toBeInTheDocument();expect(screen.getByRole('link',{name:'My schedule'})).toBeInTheDocument();expect(screen.queryByRole('link',{name:'Employees'})).not.toBeInTheDocument();expect(screen.queryByRole('link',{name:'ShiftOps Copilot'})).not.toBeInTheDocument();});
});

describe('basic dashboard',()=>{
  it('shows the four manager metrics',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/dashboard');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:manager}):response({dashboard:{employeesWorkingToday:3,unfilledShifts:2,employeesOnLeave:1,totalScheduledHours:40}}));render(<App/>);expect(await screen.findByText('Working today')).toBeInTheDocument();expect(screen.getByText('Unfilled shifts')).toBeInTheDocument();expect(screen.getByText('On approved leave')).toBeInTheDocument();expect(screen.getByText('Scheduled hours')).toBeInTheDocument();});
});

describe('ShiftOps manager workflow',()=>{
  it('lets a manager evaluate, propose, approve, apply, and inspect audit history',async()=>{
    localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/shiftops');
    vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{
      const url=String(input);
      if(url.endsWith('/auth/me'))return response({user:manager});
      if(url.endsWith('/incidents')&&init?.method==='POST')return response({incident:{id:'i1',shiftId:'s1',reason:'Employee unavailable',status:'OPEN'}},201);
      if(url.endsWith('/incidents/i1/evaluate'))return response({evaluation:{shiftId:'s1',candidates:[{employeeId:'e2',eligible:true,score:960,reasons:['AVAILABLE','ROLE_MATCH'],blockers:[]},{employeeId:'e3',eligible:false,score:0,reasons:[],blockers:['SHIFT_OVERLAP']}]}});
      if(url.endsWith('/proposals')&&init?.method==='POST')return response({proposal:{id:'p1',incidentId:'i1',replacementEmployeeId:'e2',explanation:'Eligible and available.',status:'PENDING_APPROVAL'}},201);
      if(url.endsWith('/proposals/p1/approve'))return response({proposal:{id:'p1',incidentId:'i1',replacementEmployeeId:'e2',explanation:'Eligible and available.',status:'APPROVED'}});
      if(url.endsWith('/proposals/p1/apply'))return response({proposal:{id:'p1',incidentId:'i1',replacementEmployeeId:'e2',explanation:'Eligible and available.',status:'APPLIED'}});
      if(url.endsWith('/audit'))return response({auditEvents:[{id:'a1',action:'PROPOSAL_APPLIED',entityId:'p1',newStatus:'APPLIED',timestamp:'2026-10-13T00:00:00.000Z'}]});
      return response({error:{message:'Unexpected request'}},500);
    });
    render(<App/>);
    expect(await screen.findByRole('heading',{name:'ShiftOps Copilot'})).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Shift ID/),{target:{value:'s1'}});
    fireEvent.change(screen.getByLabelText(/Incident reason/),{target:{value:'Employee unavailable'}});
    fireEvent.click(screen.getByRole('button',{name:'Create incident and evaluate'}));
    expect(await screen.findByText('e2')).toBeInTheDocument();
    expect(screen.getByText('SHIFT_OVERLAP')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Propose e2'}));
    expect(await screen.findByText('Eligible and available.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Approve proposal'}));
    expect(await screen.findByText('APPROVED')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Apply approved proposal'}));
    expect(await screen.findByText('PROPOSAL_APPLIED')).toBeInTheDocument();
  });
  it('lets a manager reject a pending proposal and prevents apply actions',async()=>{
    localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/shiftops');
    vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{const url=String(input);if(url.endsWith('/auth/me'))return response({user:manager});if(url.endsWith('/incidents')&&init?.method==='POST')return response({incident:{id:'i1'}},201);if(url.endsWith('/incidents/i1/evaluate'))return response({evaluation:{shiftId:'s1',candidates:[{employeeId:'e2',eligible:true,score:10,reasons:['AVAILABLE'],blockers:[]}]}});if(url.endsWith('/proposals')&&init?.method==='POST')return response({proposal:{id:'p1',incidentId:'i1',replacementEmployeeId:'e2',explanation:'Grounded.',status:'PENDING_APPROVAL'}},201);if(url.endsWith('/proposals/p1/reject'))return response({proposal:{id:'p1',incidentId:'i1',replacementEmployeeId:'e2',explanation:'Grounded.',status:'REJECTED'}});return response({error:{message:'Unexpected request'}},500);});
    render(<App/>);await screen.findByRole('heading',{name:'ShiftOps Copilot'});fireEvent.change(screen.getByLabelText(/Shift ID/),{target:{value:'s1'}});fireEvent.change(screen.getByLabelText(/Incident reason/),{target:{value:'Unavailable'}});fireEvent.click(screen.getByRole('button',{name:'Create incident and evaluate'}));fireEvent.click(await screen.findByRole('button',{name:'Propose e2'}));fireEvent.click(await screen.findByRole('button',{name:'Reject proposal'}));expect(await screen.findByText('REJECTED')).toBeInTheDocument();expect(screen.queryByRole('button',{name:'Apply approved proposal'})).not.toBeInTheDocument();
  });
});
