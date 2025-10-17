import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaTimes, FaCalendarCheck, FaUmbrellaBeach } from "react-icons/fa";
import {eGender, type Employee, genderLabel, genderOptions} from "../interfaces/employee.interface.ts";
import type {Department} from "../interfaces/department.interface.ts";
import {
    type LeaveRequest,
    LeaveStatus,
    leaveStatusRecord,
    LeaveType, leaveTypeOptions,
    leaveTypeRecord
} from "../interfaces/leaveRequest.interface.ts";
import type {Attendance} from "../interfaces/attendance.interface.ts";

// TODO: Reformat here with better readability

type Props = {
    employees: Employee[];
    departments?: Department[];
    onCreate?: (emp: Employee) => void;
    onDelete?: (id: number) => void;
    onCreateLeaveRequest?: (employeeId: number, leave: LeaveRequest) => void;
    onCreateAttendance?: (employeeId: number, attendance: Attendance) => void;
    title?: string;
};

type ModalState =
    | { type: "none" }
    | { type: "attendance"; employeeId: number }
    | { type: "leave"; employeeId: number };

const Employees: React.FC<Props> = ({
                                        employees,
                                        departments,
                                        onCreate,
                                        onDelete,
                                        onCreateLeaveRequest,
                                        title = "Employees",
                                    }) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [modal, setModal] = useState<ModalState>({ type: "none" });

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        gender: eGender.MALE as eGender,
        email: "",
        phone: "",
        address: "",
        position: "",
        salary: "" as string,
        hireDate: "" as string,
        departmentId: "" as string,
    });

    // Dérive l'employé sélectionné depuis les props (toujours frais)
    const selectedEmployee: Employee | undefined = useMemo(() => {
        if (modal.type === "none") return undefined;
        return employees.find((e) => e.id === modal.employeeId);
    }, [modal, employees]);

    // Fermer la modal si l'employé n'existe plus (supprimé côté parent)
    useEffect(() => {
        if (modal.type !== "none" && !selectedEmployee) {
            setModal({ type: "none" });
        }
    }, [modal, selectedEmployee]);

    const nextEmpId = useMemo(
        () => employees.reduce((m, e) => Math.max(m, e.id), 0) + 1,
        [employees]
    );

    const resetForm = () =>
        setForm({
            firstName: "",
            lastName: "",
            gender: eGender.MALE,
            email: "",
            phone: "",
            address: "",
            position: "",
            salary: "",
            hireDate: "",
            departmentId: "",
        });

    const handleDelete = (id: number) => {
        if (onDelete) onDelete(id);
        else console.log("Delete employee id:", id);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date();

        const emp: Employee = {
            id: nextEmpId,
            uniqueId: `EMP-${String(nextEmpId).padStart(4, "0")}`,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            gender: Number(form.gender) as eGender,
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            position: form.position.trim(),
            salary: Number(form.salary || 0),
            hireDate: form.hireDate ? new Date(form.hireDate) : now,
            departmentId: Number(form.departmentId || 0),
            department: undefined,
            attendances: [],
            leaveRequests: [],
            createdAt: now,
            updatedAt: now,
            createdBy: "HR-System",
            updatedBy: "HR-System",
        };

        if (onCreate) onCreate(emp);
        else console.log("Create employee:", emp);

        resetForm();
        setIsCreateOpen(false);
    };

    // ---------- Leave form ----------
    const [leaveForm, setLeaveForm] = useState({
        leaveType: LeaveType.Annual as LeaveType,
        startDate: "" as string,
        endDate: "" as string,
        reason: "" as string,
    });

    // Remet à zéro le formulaire de congé quand on ouvre/ferme la modal
    useEffect(() => {
        if (modal.type === "leave") {
            setLeaveForm({
                leaveType: LeaveType.Annual,
                startDate: "",
                endDate: "",
                reason: "",
            });
        }
    }, [modal]);

    const computeDaysRequested = (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return 0;
        const s = new Date(startDate);
        const e = new Date(endDate);
        const ms = e.getTime() - s.getTime();
        if (isNaN(ms)) return 0;
        return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleCreateLeave = (employeeId: number, e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date();
        const daysRequested = computeDaysRequested(leaveForm.startDate, leaveForm.endDate);

        const leave: LeaveRequest = {
            id:
                (employees
                    .find((emp) => emp.id === employeeId)
                    ?.leaveRequests?.reduce((m, l) => Math.max(m, l.id), 0) ?? 0) + 1,
            leaveType: Number(leaveForm.leaveType) as LeaveType,
            status: LeaveStatus.Pending,
            startDate: leaveForm.startDate ? new Date(leaveForm.startDate) : now,
            endDate: leaveForm.endDate ? new Date(leaveForm.endDate) : now,
            daysRequested,
            reason: leaveForm.reason.trim(),
            managerComment: undefined,
            reviewedAt: undefined,
            reviewedBy: undefined,
            employeeId,
            employee: undefined,
            createdAt: now,
            updatedAt: now,
            createdBy: "HR-System",
            updatedBy: "HR-System",
        };

        if (onCreateLeaveRequest) onCreateLeaveRequest(employeeId, leave);
        else console.log("Create leave request:", employeeId, leave);
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                    <FaPlus />
                    Nouveau
                </button>
            </div>

            {/* Table */}
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
                    {employees.length === 0 ? (
                        <tr>
                            <td colSpan={11} className="px-4 py-6 text-center text-gray-500">
                                Aucun employé pour le moment.
                            </td>
                        </tr>
                    ) : (
                        employees.map((e) => (
                            <tr key={e.id} className="border-t">
                                <td className="px-4 py-3">{e.id}</td>
                                <td className="px-4 py-3 font-mono">{e.uniqueId}</td>
                                <td className="px-4 py-3 font-medium">{e.lastName} {e.firstName}</td>
                                <td className="px-4 py-3">{genderLabel[e.gender]}</td>
                                <td className="px-4 py-3">{e.email}</td>
                                <td className="px-4 py-3">{e.phone}</td>
                                <td className="px-4 py-3">{e.position}</td>
                                <td className="px-4 py-3">
                                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(e.salary)}
                                </td>
                                <td className="px-4 py-3">
                                    {e.department?.name ??
                                        (departments?.find((d) => d.id === e.departmentId)?.name ?? `#${e.departmentId}`)}
                                </td>
                                <td className="px-4 py-3">
                                    {e.hireDate
                                        ? e.hireDate.toLocaleDateString("fr-FR")
                                        : new Date(e.hireDate).toLocaleDateString("fr-FR")}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setModal({ type: "attendance", employeeId: e.id })}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                            title="Voir présences"
                                        >
                                            <FaCalendarCheck />
                                            Présences
                                        </button>
                                        <button
                                            onClick={() => setModal({ type: "leave", employeeId: e.id })}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100"
                                            title="Voir/Faire une demande de congé"
                                        >
                                            <FaUmbrellaBeach />
                                            Congés
                                        </button>
                                        <button
                                            onClick={() => handleDelete(e.id)}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
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

            {/* Modal création employé (identique à ta version précédente) */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Créer un employé</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                <FaTimes />
                            </button>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreate}>
                            <div>
                                <label className="block text-sm mb-1">Prénom</label>
                                <input
                                    type="text"
                                    required
                                    value={form.firstName}
                                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Alice"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={form.lastName}
                                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Dupont"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Genre</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm((f) => ({ ...f, gender: Number(e.target.value) as eGender }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {genderOptions.map((g) => (
                                        <option key={g} value={g}>{genderLabel[g]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="alice@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+33 6 12 34 56 78"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm mb-1">Adresse</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="12 rue des Fleurs, 75002 Paris"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Poste</label>
                                <input
                                    type="text"
                                    value={form.position}
                                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Développeuse Frontend"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Salaire (€/an)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.salary}
                                    onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="42000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Date d'embauche</label>
                                <input
                                    type="date"
                                    value={form.hireDate}
                                    onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Département</label>
                                <select
                                    value={form.departmentId}
                                    onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">— Choisir —</option>
                                    {departments?.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------- MODAL PRÉSENCES ---------------- */}
            {modal.type === "attendance" && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setModal({ type: "none" })} />
                    <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">
                                Présences — {selectedEmployee.lastName} {selectedEmployee.firstName}
                            </h3>
                            <button onClick={() => setModal({ type: "none" })} className="p-2 rounded-lg hover:bg-gray-100">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Arrivée</th>
                                    <th className="px-4 py-3">Départ</th>
                                    <th className="px-4 py-3">Pause</th>
                                    <th className="px-4 py-3">Heures</th>
                                    <th className="px-4 py-3">Heures sup.</th>
                                    <th className="px-4 py-3">Notes</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(selectedEmployee.attendances ?? []).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                            Aucune présence enregistrée.
                                        </td>
                                    </tr>
                                ) : (
                                    (selectedEmployee.attendances ?? []).map((a) => (
                                        <tr key={a.id} className="border-t">
                                            <td className="px-4 py-3">
                                                {a.dateTime
                                                    ? a.dateTime.toLocaleDateString("fr-FR")
                                                    : new Date(a.dateTime).toLocaleDateString("fr-FR")}
                                            </td>
                                            <td className="px-4 py-3">{a.clockIn}</td>
                                            <td className="px-4 py-3">{a.clockOut}</td>
                                            <td className="px-4 py-3">{a.breakDuration}</td>
                                            <td className="px-4 py-3">{a.workedHour}</td>
                                            <td className="px-4 py-3">{a.overtimeHours}</td>
                                            <td className="px-4 py-3">{a.notes}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- MODAL CONGÉS ---------------- */}
            {modal.type === "leave" && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setModal({ type: "none" })} />
                    <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">
                                Congés — {selectedEmployee.lastName} {selectedEmployee.firstName}
                            </h3>
                            <button onClick={() => setModal({ type: "none" })} className="p-2 rounded-lg hover:bg-gray-100">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Liste */}
                        <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left">
                                <tr>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Statut</th>
                                    <th className="px-4 py-3">Du</th>
                                    <th className="px-4 py-3">Au</th>
                                    <th className="px-4 py-3">Jours</th>
                                    <th className="px-4 py-3">Raison</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(selectedEmployee.leaveRequests ?? []).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                            Aucune demande pour le moment.
                                        </td>
                                    </tr>
                                ) : (
                                    (selectedEmployee.leaveRequests ?? []).map((lr) => (
                                        <tr key={lr.id} className="border-t">
                                            <td className="px-4 py-3">{leaveTypeRecord[lr.leaveType]}</td>
                                            <td className="px-4 py-3">{leaveStatusRecord[lr.status]}</td>
                                            <td className="px-4 py-3">
                                                {lr.startDate
                                                    ? lr.startDate.toLocaleDateString("fr-FR")
                                                    : new Date(lr.startDate).toLocaleDateString("fr-FR")}
                                            </td>
                                            <td className="px-4 py-3">
                                                {lr.endDate
                                                    ? lr.endDate.toLocaleDateString("fr-FR")
                                                    : new Date(lr.endDate).toLocaleDateString("fr-FR")}
                                            </td>
                                            <td className="px-4 py-3">{lr.daysRequested}</td>
                                            <td className="px-4 py-3">{lr.reason}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Formulaire nouvelle demande */}
                        <form
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            onSubmit={(e) => handleCreateLeave(selectedEmployee.id, e)}
                        >
                            <div>
                                <label className="block text-sm mb-1">Type de congé</label>
                                <select
                                    value={leaveForm.leaveType}
                                    onChange={(e) => setLeaveForm((f) => ({ ...f, leaveType: Number(e.target.value) as LeaveType }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {leaveTypeOptions.map((t) => (
                                        <option key={t} value={t}>{leaveTypeRecord[t]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Raison</label>
                                <input
                                    type="text"
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Vacances, rendez-vous médical…"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Date de début</label>
                                <input
                                    type="date"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Date de fin</label>
                                <input
                                    type="date"
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-between pt-2">
                                <div className="text-sm text-gray-600">
                                    Jours demandés :{" "}
                                    <strong>{computeDaysRequested(leaveForm.startDate, leaveForm.endDate)}</strong>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setModal({ type: "none" })} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                                        Fermer
                                    </button>
                                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                        Demander
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
