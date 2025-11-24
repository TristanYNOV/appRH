import React, { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import type { Employee } from "../../../interfaces/employee.codec.ts";
import {
    LeaveStatus,
    LeaveType,
    leaveStatusRecord,
    leaveTypeOptions,
    leaveTypeRecord,
    type LeaveRequest,
} from "../../../interfaces/leaveRequest.codec.ts";

type LeaveFormValues = {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
};

type Props = {
    isOpen: boolean;
    employee: Employee | undefined;
    onClose: () => void;
    onSubmit: (leave: LeaveRequest) => void;
};

const createEmptyLeaveForm = (): LeaveFormValues => ({
    leaveType: LeaveType.Annual,
    startDate: "",
    endDate: "",
    reason: "",
});

const computeDaysRequested = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const ms = end.getTime() - start.getTime();
    if (Number.isNaN(ms)) return 0;
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
};

const EmployeeLeaveModal: React.FC<Props> = ({ isOpen, employee, onClose, onSubmit }) => {
    const [form, setForm] = useState<LeaveFormValues>(createEmptyLeaveForm());

    useEffect(() => {
        if (!isOpen) return;
        setForm(createEmptyLeaveForm());
    }, [isOpen, employee?.id]);

    const daysRequested = useMemo(
        () => computeDaysRequested(form.startDate, form.endDate),
        [form.endDate, form.startDate]
    );

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                        Congés — {employee.lastName} {employee.firstName}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer">
                        <FaTimes />
                    </button>
                </div>

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
                            {(employee.leaveRequests ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                        Aucune demande pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                (employee.leaveRequests ?? []).map((request) => (
                                    <tr key={request.id} className="border-t">
                                        <td className="px-4 py-3">{leaveTypeRecord[request.leaveType]}</td>
                                        <td className="px-4 py-3">{leaveStatusRecord[request.status]}</td>
                                        <td className="px-4 py-3">
                                            {request.startDate
                                                ? request.startDate.toLocaleDateString("fr-FR")
                                                : new Date(request.startDate).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-4 py-3">
                                            {request.endDate
                                                ? request.endDate.toLocaleDateString("fr-FR")
                                                : new Date(request.endDate).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-4 py-3">{request.daysRequested}</td>
                                        <td className="px-4 py-3">{request.reason}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const now = new Date();
                        const lastId = (employee.leaveRequests ?? []).reduce(
                            (max, request) => Math.max(max, request.id),
                            0
                        );

                        const leaveRequest: LeaveRequest = {
                            id: lastId + 1,
                            leaveType: form.leaveType,
                            status: LeaveStatus.Pending,
                            startDate: form.startDate ? new Date(form.startDate) : now,
                            endDate: form.endDate ? new Date(form.endDate) : now,
                            daysRequested,
                            reason: form.reason.trim(),
                            managerComment: undefined,
                            reviewedAt: undefined,
                            reviewedBy: undefined,
                            employeeId: employee.id,
                            employee: undefined,
                            createdAt: now,
                            updatedAt: now,
                            createdBy: "HR-System",
                            updatedBy: "HR-System",
                        };

                        onSubmit(leaveRequest);
                    }}
                >
                    <div>
                        <label className="block text-sm mb-1">Type de congé</label>
                        <select
                            value={form.leaveType}
                            onChange={(e) => setForm((f) => ({ ...f, leaveType: Number(e.target.value) as LeaveType }))}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {leaveTypeOptions.map((type) => (
                                <option key={type} value={type}>
                                    {leaveTypeRecord[type]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Raison</label>
                        <input
                            type="text"
                            value={form.reason}
                            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Vacances, rendez-vous médical…"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Date de début</label>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Date de fin</label>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-600">
                            Jours demandés : <strong>{daysRequested}</strong>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                                Fermer
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Demander
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeLeaveModal;
