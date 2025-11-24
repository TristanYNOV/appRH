import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaCalendarCheck, FaUmbrellaBeach, FaPen } from "react-icons/fa";
import { eGender, type Employee, genderLabel } from "../../interfaces/employee.codec.ts";
import type { Attendance } from "../../interfaces/attendance.codec.ts";
import type { Department } from "../../interfaces/department.codec.ts";
import type { LeaveRequest } from "../../interfaces/leaveRequest.codec.ts";
import EmployeeFormModal, { type EmployeeFormValues } from "./modals/EmployeeFormModal.tsx";
import EmployeeAttendanceModal from "./modals/EmployeeAttendanceModal.tsx";
import EmployeeLeaveModal from "./modals/EmployeeLeaveModal.tsx";

type Props = {
    employees: Employee[];
    departments?: Department[];
    onCreate?: (emp: Employee) => void;
    onUpdate?: (emp: Employee) => void;
    onDelete?: (id: number) => void;
    onCreateLeaveRequest?: (employeeId: number, leave: LeaveRequest) => void;
    onCreateAttendance?: (employeeId: number, attendance: Attendance) => void;
    isLoading?: boolean;
    disableCrudActions?: boolean;
    disableAttendanceActions?: boolean;
    disableLeaveActions?: boolean;
    title?: string;
};

type ModalState =
    | { type: "none" }
    | { type: "attendance"; employeeId: number }
    | { type: "leave"; employeeId: number };

const EmployeeList: React.FC<Props> = ({
    employees,
    departments,
    onCreate,
    onUpdate,
    onDelete,
    onCreateLeaveRequest,
    isLoading = false,
    disableCrudActions = false,
    disableAttendanceActions = false,
    disableLeaveActions = false,
    title = "Employees",
}) => {
    const [employeeForm, setEmployeeForm] = useState<
        { mode: "create" } | { mode: "update"; employeeId: number }
    >();
    const [modal, setModal] = useState<ModalState>({ type: "none" });

    const currencyFormatter = useMemo(
        () => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }),
        []
    );
    const departmentById = useMemo(() => {
        if (!departments) return new Map<number, Department>();
        return new Map(departments.map((dept) => [dept.id, dept]));
    }, [departments]);

    const selectedEmployee: Employee | undefined = useMemo(() => {
        if (modal.type === "none") return undefined;
        return employees.find((e) => e.id === modal.employeeId);
    }, [modal, employees]);

    useEffect(() => {
        if (disableCrudActions) {
            setEmployeeForm(undefined);
        }
    }, [disableCrudActions]);

    useEffect(() => {
        if (disableAttendanceActions && modal.type === "attendance") {
            setModal({ type: "none" });
        }
    }, [disableAttendanceActions, modal.type]);

    useEffect(() => {
        if (disableLeaveActions && modal.type === "leave") {
            setModal({ type: "none" });
        }
    }, [disableLeaveActions, modal.type]);

    useEffect(() => {
        if (modal.type !== "none" && !selectedEmployee) {
            setModal({ type: "none" });
        }
    }, [modal, selectedEmployee]);

    const employeeFormEmployee = useMemo(() => {
        if (!employeeForm || employeeForm.mode !== "update") return undefined;
        return employees.find((e) => e.id === employeeForm.employeeId);
    }, [employeeForm, employees]);

    const employeeFormInitialValues: Partial<EmployeeFormValues> | undefined = useMemo(() => {
        if (!employeeFormEmployee) return undefined;
        const hireDate = employeeFormEmployee.hireDate
            ? new Date(employeeFormEmployee.hireDate).toISOString().slice(0, 10)
            : "";
        return {
            firstName: employeeFormEmployee.firstName ?? "",
            lastName: employeeFormEmployee.lastName ?? "",
            gender: employeeFormEmployee.gender,
            email: employeeFormEmployee.email ?? "",
            phone: employeeFormEmployee.phone ?? "",
            address: employeeFormEmployee.address ?? "",
            position: employeeFormEmployee.position ?? "",
            salary: employeeFormEmployee.salary ? String(employeeFormEmployee.salary) : "",
            hireDate,
            departmentId: employeeFormEmployee.departmentId
                ? String(employeeFormEmployee.departmentId)
                : "",
        };
    }, [employeeFormEmployee]);

    const nextEmpId = useMemo(
        () => employees.reduce((m, e) => Math.max(m, e.id), 0) + 1,
        [employees]
    );

    const handleDelete = (id: number) => {
        if (onDelete) onDelete(id);
        else console.log("Delete employee id:", id);
    };

    const handleEmployeeSubmit = (values: EmployeeFormValues) => {
        const now = new Date();
        if (employeeForm?.mode === "create") {
            const departmentId = Number(values.departmentId || 0);
            const department = departments?.find((d) => d.id === departmentId);
            const employee: Employee = {
                id: nextEmpId,
                uniqueId: `EMP-${String(nextEmpId).padStart(4, "0")}`,
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                gender: Number(values.gender) as eGender,
                email: values.email.trim(),
                phone: values.phone.trim(),
                address: values.address.trim(),
                position: values.position.trim(),
                salary: Number(values.salary || 0),
                hireDate: values.hireDate ? new Date(values.hireDate) : now,
                departmentId,
                department,
                attendances: [],
                leaveRequests: [],
                createdAt: now,
                updatedAt: now,
                createdBy: "HR-System",
                updatedBy: "HR-System",
            };

            if (onCreate) onCreate(employee);
            else console.log("Create employee:", employee);
        } else if (employeeForm?.mode === "update" && employeeFormEmployee) {
            const departmentId = Number(values.departmentId || 0);
            const department = departments?.find((d) => d.id === departmentId) ?? employeeFormEmployee.department;
            const updatedEmployee: Employee = {
                ...employeeFormEmployee,
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                gender: Number(values.gender) as eGender,
                email: values.email.trim(),
                phone: values.phone.trim(),
                address: values.address.trim(),
                position: values.position.trim(),
                salary: Number(values.salary || 0),
                hireDate: values.hireDate ? new Date(values.hireDate) : employeeFormEmployee.hireDate,
                departmentId,
                department,
                updatedAt: now,
                updatedBy: "HR-System",
            };

            if (onUpdate) onUpdate(updatedEmployee);
            else console.log("Update employee:", updatedEmployee);
        }

        setEmployeeForm(undefined);
    };

    const handleLeaveSubmit = (employeeId: number, leave: LeaveRequest) => {
        if (onCreateLeaveRequest) onCreateLeaveRequest(employeeId, leave);
        else console.log("Create leave request:", employeeId, leave);
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <button
                    onClick={() => {
                        if (disableCrudActions) return;
                        setEmployeeForm({ mode: "create" });
                    }}
                    disabled={disableCrudActions}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50${
                        disableCrudActions ? " opacity-60 cursor-not-allowed" : ""
                    }`}
                >
                    <FaPlus />
                    Nouveau
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">UID</th>
                            <th className="px-4 py-3">Nom</th>
                            <th className="px-4 py-3">Genre</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Téléphone</th>
                            <th className="px-4 py-3">Poste</th>
                            <th className="px-4 py-3">Salaire</th>
                            <th className="px-4 py-3">Département</th>
                            <th className="px-4 py-3">Embauche</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                                    Chargement des employés…
                                </td>
                            </tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                                    Aucun employé pour le moment.
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee.id} className="border-t">
                                    <td className="px-4 py-3">{employee.id}</td>
                                    <td className="px-4 py-3 font-mono">{employee.uniqueId}</td>
                                    <td className="px-4 py-3 font-medium">
                                        {employee.lastName} {employee.firstName}
                                    </td>
                                    <td className="px-4 py-3">{genderLabel[employee.gender]}</td>
                                    <td className="px-4 py-3">{employee.email}</td>
                                    <td className="px-4 py-3">{employee.phone}</td>
                                    <td className="px-4 py-3">{employee.position}</td>
                                    <td className="px-4 py-3">{currencyFormatter.format(employee.salary)}</td>
                                    <td className="px-4 py-3">
                                        {employee.department?.name ?? departmentById.get(employee.departmentId)?.name ?? `#${employee.departmentId}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        {employee.hireDate
                                            ? employee.hireDate.toLocaleDateString("fr-FR")
                                            : new Date(employee.hireDate).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    if (disableCrudActions) return;
                                                    setEmployeeForm({ mode: "update", employeeId: employee.id });
                                                }}
                                                disabled={disableCrudActions}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100${
                                                    disableCrudActions ? " opacity-60 cursor-not-allowed" : ""
                                                }`}
                                                title="Modifier"
                                            >
                                                <FaPen />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (disableAttendanceActions) return;
                                                    setModal({ type: "attendance", employeeId: employee.id });
                                                }}
                                                disabled={disableAttendanceActions}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100${
                                                    disableAttendanceActions ? " opacity-60 cursor-not-allowed" : ""
                                                }`}
                                                title="Voir présences"
                                            >
                                                <FaCalendarCheck />
                                                Présences
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (disableLeaveActions) return;
                                                    setModal({ type: "leave", employeeId: employee.id });
                                                }}
                                                disabled={disableLeaveActions}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100${
                                                    disableLeaveActions ? " opacity-60 cursor-not-allowed" : ""
                                                }`}
                                                title="Voir/Faire une demande de congé"
                                            >
                                                <FaUmbrellaBeach />
                                                Congés
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (disableCrudActions) return;
                                                    handleDelete(employee.id);
                                                }}
                                                disabled={disableCrudActions}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100${
                                                    disableCrudActions ? " opacity-60 cursor-not-allowed" : ""
                                                }`}
                                                title="Supprimer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EmployeeFormModal
                isOpen={Boolean(employeeForm)}
                mode={employeeForm?.mode ?? "create"}
                onClose={() => setEmployeeForm(undefined)}
                onSubmit={handleEmployeeSubmit}
                departments={departments}
                initialValues={employeeFormInitialValues}
            />

            <EmployeeAttendanceModal
                isOpen={modal.type === "attendance"}
                employee={selectedEmployee}
                onClose={() => setModal({ type: "none" })}
            />

            <EmployeeLeaveModal
                isOpen={modal.type === "leave"}
                employee={selectedEmployee}
                onClose={() => setModal({ type: "none" })}
                onSubmit={(leave) => {
                    if (!selectedEmployee) return;
                    handleLeaveSubmit(selectedEmployee.id, leave);
                    setModal({ type: "none" });
                }}
            />
        </div>
    );
};

export default EmployeeList;
