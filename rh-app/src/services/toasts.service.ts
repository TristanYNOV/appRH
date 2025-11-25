import toast from "react-hot-toast";
import type { Attendance, AttendanceCreate, AttendanceUpdate } from "../interfaces/attendance.codec.ts";
import type { Department } from "../interfaces/department.codec.ts";
import type {
    CreateEmployeePayload,
    Employee,
    UpdateEmployeePayload,
} from "../interfaces/employee.codec.ts";
import type { LeaveRequest } from "../interfaces/leaveRequest.codec.ts";

type PersonLike = Pick<Employee, "fullName"> | CreateEmployeePayload | UpdateEmployeePayload;

const formatPerson = (employee: PersonLike) => {
    if ("fullName" in employee && employee.fullName) return employee.fullName;
    const firstName = "firstName" in employee && employee.firstName ? employee.firstName : "";
    const lastName = "lastName" in employee && employee.lastName ? employee.lastName : "";
    const full = `${lastName} ${firstName}`.trim();
    return full.length > 0 ? full : "Employé";
};

type AttendanceLike =
    | Attendance
    | AttendanceCreate
    | AttendanceUpdate
    | (Attendance & { employeeFullName?: string });

const formatAttendance = (attendance?: AttendanceLike) => {
    if (!attendance) return "présence";
    const dateValue = "date" in attendance ? attendance.date : undefined;
    const parsedDate =
        dateValue instanceof Date
            ? dateValue
            : typeof dateValue === "string"
              ? new Date(dateValue)
              : undefined;
    const labelDate = parsedDate ? parsedDate.toLocaleDateString("fr-FR") : "présence";
    const employeeName =
        ("employeeName" in attendance && attendance.employeeName) ||
        ("employeeFullName" in attendance && attendance.employeeFullName);
    return employeeName ? `${labelDate} — ${employeeName}` : `Présence du ${labelDate}`;
};

export const toastService = {
    dismiss: (toastId: string | number | undefined) => {
        if (toastId !== undefined) {
            toast.dismiss(String(toastId));
        }
    },
    authAttempt: () => toast.loading("Authentification en cours"),
    authSuccess: () => toast.success("Authentification réussie"),
    authFailed: (message: string) => toast.error(`Impossible de se connecter : ${message}`),

    apiUnavailable: (feature: string) => toast.error(`Fonctionnalité indisponible : ${feature}`),
    apiRestored: (feature: string) => toast.success(`Fonctionnalité rétablie : ${feature}`),
    apiReconnectAttempt: () => toast.loading("Tentative de reconnexion à l'API…"),
    apiReconnectSuccess: () => toast.success("Reconnexion à l'API réussie !"),
    apiReconnectFailed: (message?: string) =>
        toast.error(message ? `La reconnexion a échoué : ${message}` : "La reconnexion a échoué."),
    apiConfigTest: () => toast.loading("Vérification de l'adresse de l'API…"),
    apiConfigSuccess: (url: string) => toast.success(`Adresse de l'API enregistrée : ${url}`),
    apiConfigFailed: (message: string) => toast.error(`Impossible de contacter l'API : ${message}`),

    // EMPLOYEE
    employeeSyncFailed: (message: string) => toast.error(`Synchronisation des employés impossible : ${message}`),
    employeeCreation: (employee: PersonLike) =>
        toast.loading(`Création de l'employé ${formatPerson(employee)} en cours…`),
    employeeCreated: (employee: PersonLike) =>
        toast.success(`Employé ${formatPerson(employee)} créé avec succès !`),
    employeeCreationFailed: (message: string) => toast.error(`Création employé échouée : ${message}`),
    employeeUpdate: (employee: PersonLike) =>
        toast.loading(`Mise à jour de ${formatPerson(employee)} en cours…`),
    employeeUpdated: (employee: PersonLike) =>
        toast.success(`Employé ${formatPerson(employee)} mis à jour !`),
    employeeUpdateFailed: (message: string) => toast.error(`Mise à jour employé échouée : ${message}`),
    employeeDeletion: (employee: Employee) =>
        toast.loading(`Suppression de ${formatPerson(employee)} en cours…`),
    employeeDeleted: (employee: Employee) =>
        toast.success(`Employé ${formatPerson(employee)} supprimé.`),
    employeeDeletionFailed: (message: string) => toast.error(`Suppression employé échouée : ${message}`),

    // DEPARTMENT
    departmentSyncFailed: (message: string) => toast.error(`Synchronisation des départements impossible : ${message}`),
    departmentCreation: (department: Department) =>
        toast.loading(`Création du département ${department.name} (${department.code})…`),
    departmentCreated: (department: Department) =>
        toast.success(`Département ${department.name} créé !`),
    departmentCreationFailed: (message: string) => toast.error(`Création département échouée : ${message}`),
    departmentUpdate: (department: Department) =>
        toast.loading(`Mise à jour du département ${department.name}…`),
    departmentUpdated: (department: Department) =>
        toast.success(`Département ${department.name} mis à jour !`),
    departmentUpdateFailed: (message: string) => toast.error(`Mise à jour département échouée : ${message}`),
    departmentDeletion: (department: Department) =>
        toast.loading(`Suppression du département ${department.name}…`),
    departmentDeleted: (department: Department) =>
        toast.success(`Département ${department.name} supprimé.`),
    departmentDeletionFailed: (message: string) => toast.error(`Suppression département échouée : ${message}`),

    // ATTENDANCE
    attendanceSyncFailed: (message: string) =>
        toast.error(`Synchronisation des présences impossible : ${message}`),
    attendanceCreation: (attendance?: AttendanceLike) =>
        toast.loading(`Enregistrement ${formatAttendance(attendance)}…`),
    attendanceCreated: (attendance: AttendanceLike) =>
        toast.success(`Présence enregistrée (${formatAttendance(attendance)})`),
    attendanceCreationFailed: (message: string) => toast.error(`Création présence échouée : ${message}`),
    attendanceUpdate: (attendance?: AttendanceLike) =>
        toast.loading(`Mise à jour ${formatAttendance(attendance)}…`),
    attendanceUpdated: (attendance: AttendanceLike) =>
        toast.success(`Présence mise à jour (${formatAttendance(attendance)})`),
    attendanceUpdateFailed: (message: string) => toast.error(`Mise à jour présence échouée : ${message}`),
    attendanceDeletion: (attendance?: AttendanceLike) =>
        toast.loading(`Suppression ${formatAttendance(attendance)}…`),
    attendanceDeleted: (attendance: AttendanceLike) =>
        toast.success(`Présence supprimée (${formatAttendance(attendance)})`),
    attendanceDeletionFailed: (message: string) => toast.error(`Suppression présence échouée : ${message}`),

    // Files
    fileImporting: (label: string) => toast.loading(`Import ${label} en cours…`),
    fileImported: (label: string) => toast.success(`Import ${label} terminé !`),
    fileImportFailed: (label: string, message: string) =>
        toast.error(`Import ${label} échoué : ${message}`),
    fileExporting: (label: string) => toast.loading(`Export ${label} en cours…`),
    fileExported: (label: string) => toast.success(`Export ${label} prêt !`),
    fileExportFailed: (label: string, message: string) =>
        toast.error(`Export ${label} échoué : ${message}`),

    // leaveRequest
    leaveRequest: (leaveReq: LeaveRequest) =>
        toast.loading(
            `Demande d'absence du ${leaveReq.startDate} au ${leaveReq.endDate} en cours…`
        ),
    leaveRequestAdded: () => toast.success("Votre demande d'absence a bien été transmise !"),
    leaveRequestFailed: (message: string) => toast.error(`La demande n'a pas été envoyée : ${message}`),

    featureUnavailable: (feature: string) => toast.error(`${feature} n'est pas encore disponible.`),
} as const;
