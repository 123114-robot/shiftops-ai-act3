export type Shift={id:string;employeeId:string|null;date:string;startTime:string;endTime:string;role:string;notes:string|null;status:'DRAFT'|'SCHEDULED'|'CANCELLED';createdById:string;createdAt:string;updatedAt:string};
export type ShiftInput={employeeId?:string|null;date:string;startTime:string;endTime:string;role:string;notes?:string|null;status?:'DRAFT'|'SCHEDULED'};
const baseUrl=import.meta.env.VITE_API_URL??'http://localhost:3000/api';
async function shiftRequest<T>(path:string,token:string,init:RequestInit={}){const response=await fetch(`${baseUrl}${path}`,{...init,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...init.headers}});if(!response.ok){const body=await response.json().catch(()=>null) as {error?:{message?:string}}|null;throw new Error(body?.error?.message??'Shift request failed.');}return response.json() as Promise<T>;}
export async function listShifts(token:string,startDate:string,endDate:string){return(await shiftRequest<{shifts:Shift[]}>(`/shifts?startDate=${startDate}&endDate=${endDate}`,token)).shifts;}
export async function createShift(token:string,input:ShiftInput){return(await shiftRequest<{shift:Shift}>('/shifts',token,{method:'POST',body:JSON.stringify(input)})).shift;}
export async function updateShift(token:string,id:string,input:Partial<ShiftInput>){return(await shiftRequest<{shift:Shift}>(`/shifts/${id}`,token,{method:'PATCH',body:JSON.stringify(input)})).shift;}
export async function cancelShift(token:string,id:string){return(await shiftRequest<{shift:Shift}>(`/shifts/${id}`,token,{method:'DELETE'})).shift;}
