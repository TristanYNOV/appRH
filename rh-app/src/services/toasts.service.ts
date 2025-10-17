import toast from "react-hot-toast";
import type {Employee} from "../interfaces/employee.interface.ts";
import type {Department} from "../interfaces/department.interface.ts";
import type {LeaveRequest} from "../interfaces/leaveRequest.interface.ts";

export const toastService = {
    authAttenmpt: () => toast.loading('Authentification en cours'),
    authSuccess: () => toast.success('Authentification réussie'),
    // EMPLOYEE
    employeeCreation: (employee: Employee) => toast.loading(`Un nouvel employé arrive !: ${employee.lastName} - ${employee.firstName}`),
    employeeCreated: (employee: Employee) => toast.success(`Employé bien accueilli !: ${employee.lastName} - ${employee.firstName}`),
    employeeCreationFailed: (message: string) => toast.error(`Employé perdu ...: ${message}`),
    // DEPARTMENT
    departmentCreation: (department: Department) => toast.loading(`Ouverture d'un département en cours: ${department.name} - ${department.code}`),
    departmentCreated: (department: Department) => toast.success(`Département ouvert : ${department.name} - ${department.code}`),
    departmentCreationFailed: (message: string) => toast.error(`Le département semble fermé ...: ${message}`),
    // leaveRequest
    leaveRequest: (leaveReq: LeaveRequest) => toast.loading(`Fuite demandée pour la période: ${leaveReq.startDate} - ${leaveReq.endDate}`),
    leaveRequestAdded: () => toast.success(`Votre demande d'absence a bien été transmise !`),
    leaveRequestFailed: (message: string) => toast.error(`La demande n'a pas été envoyée: ${message}`),
} as const;
