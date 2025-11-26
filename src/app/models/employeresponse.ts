import {AttachmentDTO} from './attachmentdto';


export interface EmployeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  pims: number;
  cuid: string;
  role: string;
  attachment?: AttachmentDTO;
}
