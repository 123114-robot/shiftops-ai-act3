import { cleanup,fireEvent,render,screen } from '@testing-library/react';
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
  it('updates employee details',async()=>{managerSession();window.history.pushState({},'','/employees/e1');render(<App/>);await screen.findByRole('heading',{name:'Barry Nguyen'});fireEvent.click(screen.getByRole('button',{name:'Edit employee'}));fireEvent.change(screen.getByLabelText(/job title/i),{target:{value:'Head Chef'}});fireEvent.click(screen.getByRole('button',{name:'Save changes'}));expect(await screen.findByText('Employee updated successfully.')).toBeInTheDocument();expect(screen.getByText('Head Chef')).toBeInTheDocument();});
  it('deactivates an employee from the detail page and keeps the profile visible',async()=>{managerSession();window.history.pushState({},'','/employees/e1');render(<App/>);await screen.findByRole('heading',{name:'Barry Nguyen'});fireEvent.click(screen.getByRole('button',{name:'Deactivate employee'}));expect(await screen.findByText('Employee deactivated successfully.')).toBeInTheDocument();expect(screen.getAllByText('INACTIVE').length).toBeGreaterThan(0);expect(screen.getByRole('heading',{name:'Barry Nguyen'})).toBeInTheDocument();});
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
    expect(await screen.findByText('09:00–17:00')).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Save availability'})).not.toBeInTheDocument();
  });
});

describe('shift UI',()=>{
  const shift={id:'s1',employeeId:null,date:'2026-10-01T00:00:00.000Z',startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'DRAFT',createdById:'m',createdAt:'',updatedAt:''};
  it('lets a manager list, create, edit, and cancel shifts',async()=>{
    localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/shifts');
    vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>{const url=String(input);if(url.endsWith('/auth/me'))return response({user:manager});if(init?.method==='POST')return response({shift:{...shift,id:'s2',role:'Supervisor'}},201);if(init?.method==='PATCH')return response({shift:{...shift,role:'Head Chef'}});if(init?.method==='DELETE')return response({shift:{...shift,status:'CANCELLED'}});return response({shifts:[shift]});});
    render(<App/>);expect(await screen.findByRole('heading',{name:'Shifts'})).toBeInTheDocument();expect(await screen.findByText('Chef')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Required role'),{target:{value:'Supervisor'}});fireEvent.click(screen.getByRole('button',{name:'Create shift'}));expect(await screen.findByText('Shift created successfully.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button',{name:'Edit shift'})[0]!);fireEvent.change(screen.getByLabelText('Required role'),{target:{value:'Head Chef'}});fireEvent.click(screen.getByRole('button',{name:'Save shift'}));expect(await screen.findByText('Shift updated successfully.')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button',{name:'Cancel shift'})[0]!);expect(await screen.findByText('Shift cancelled successfully.')).toBeInTheDocument();
  });
});

describe('leave UI',()=>{
  const leave={id:'l1',employeeId:'e1',startDate:'2026-10-10T00:00:00.000Z',endDate:'2026-10-11T00:00:00.000Z',reason:'Holiday',status:'PENDING',reviewedById:null,reviewedAt:null,createdAt:'',updatedAt:''};
  it('lets an employee submit and view leave status',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/my-leave');vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>String(input).endsWith('/auth/me')?response({user:employeeUser}):init?.method==='POST'?response({leaveRequest:{...leave,id:'l2'}},201):response({leaveRequests:[leave]}));render(<App/>);expect(await screen.findByRole('heading',{name:'My leave'})).toBeInTheDocument();expect(await screen.findByText('Holiday')).toBeInTheDocument();fireEvent.change(screen.getByLabelText('Start date'),{target:{value:'2026-10-10'}});fireEvent.change(screen.getByLabelText('End date'),{target:{value:'2026-10-11'}});fireEvent.change(screen.getByLabelText('Reason'),{target:{value:'Holiday'}});fireEvent.click(screen.getByRole('button',{name:'Submit leave request'}));expect(await screen.findByText('Leave request submitted successfully.')).toBeInTheDocument();});
  it('lets a manager approve a pending request',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/leave-requests');vi.spyOn(globalThis,'fetch').mockImplementation((input,init)=>String(input).endsWith('/auth/me')?response({user:manager}):init?.method==='PATCH'?response({leaveRequest:{...leave,status:'APPROVED'}}):response({leaveRequests:[leave]}));render(<App/>);expect(await screen.findByRole('heading',{name:'Leave requests'})).toBeInTheDocument();fireEvent.click(await screen.findByRole('button',{name:'Approve'}));expect(await screen.findByText('Leave request approved.')).toBeInTheDocument();expect(screen.getByText('APPROVED')).toBeInTheDocument();});
});

describe('weekly roster UI',()=>{
  const shift={id:'s1',employeeId:'e1',date:'2026-10-05T00:00:00.000Z',startTime:'09:00',endTime:'17:00',role:'Chef',notes:null,status:'SCHEDULED',createdById:'m',createdAt:'',updatedAt:''};
  it('shows the full weekly roster to managers',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/roster');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:manager}):response({shifts:[shift]}));render(<App/>);expect(await screen.findByRole('heading',{name:'Weekly roster'})).toBeInTheDocument();expect(await screen.findByText('Chef')).toBeInTheDocument();expect(screen.getByText('e1')).toBeInTheDocument();});
  it('shows an employee personal weekly schedule',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/my-roster');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:employeeUser}):response({shifts:[shift]}));render(<App/>);expect(await screen.findByRole('heading',{name:'My weekly schedule'})).toBeInTheDocument();expect(await screen.findByText('09:00–17:00')).toBeInTheDocument();});
});

describe('basic dashboard',()=>{
  it('shows the four manager metrics',async()=>{localStorage.setItem('shiftflow_token','valid');window.history.pushState({},'','/dashboard');vi.spyOn(globalThis,'fetch').mockImplementation(input=>String(input).endsWith('/auth/me')?response({user:manager}):response({dashboard:{employeesWorkingToday:3,unfilledShifts:2,employeesOnLeave:1,totalScheduledHours:40}}));render(<App/>);expect(await screen.findByText('Working today')).toBeInTheDocument();expect(screen.getByText('Unfilled shifts')).toBeInTheDocument();expect(screen.getByText('On approved leave')).toBeInTheDocument();expect(screen.getByText('Scheduled hours')).toBeInTheDocument();});
});
