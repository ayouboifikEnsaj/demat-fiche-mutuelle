import {EmployeeResponse} from './employeresponse';


export interface LoginResponse {
  token: string;
  expiresIn: number;
  employee: EmployeeResponse;
}
