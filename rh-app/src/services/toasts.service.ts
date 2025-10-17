import toast from "react-hot-toast";
import type {Employee} from "../interfaces/employee.interface.ts";
import type {Department} from "../interfaces/department.interface.ts";
import type {LeaveRequest} from "../interfaces/leaveRequest.interface.ts";

const formatPerson = (employee: Employee) => `${employee.lastName} ${employee.firstName}`.trim();

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

    // EMPLOYEE
    employeeSyncFailed: (message: string) => toast.error(`Synchronisation des employés impossible : ${message}`),
    employeeCreation: (employee: Employee) =>
        toast.loading(`Création de l'employé ${formatPerson(employee)} en cours…`),
    employeeCreated: (employee: Employee) =>
        toast.success(`Employé ${formatPerson(employee)} créé avec succès !`),
    employeeCreationFailed: (message: string) => toast.error(`Création employé échouée : ${message}`),
    employeeUpdate: (employee: Employee) =>
        toast.loading(`Mise à jour de ${formatPerson(employee)} en cours…`),
    employeeUpdated: (employee: Employee) =>
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
