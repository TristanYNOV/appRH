import React, { useMemo, useState } from "react";
import { FaPen, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import AttendanceFormModal from "../../attendances/AttendanceFormModal.tsx";
import type {
    Attendance,
    AttendanceCreate,
    AttendanceUpdate,
} from "../../../interfaces/attendance.codec.ts";
import type { Employee } from "../../../interfaces/employee.codec.ts";

type Props = {
    isOpen: boolean;
    employee: Employee | undefined;
    employees: Employee[];
    attendances: Attendance[];
    disableActions?: boolean;
    onClose: () => void;
    onCreateAttendance: (attendance: AttendanceCreate) => void;
    onUpdateAttendance: (id: number, attendance: AttendanceUpdate) => void;
    onDeleteAttendance: (id: number) => void;
};

type AttendanceModalState =
    | { type: "none" }
    | { type: "create" }
    | { type: "edit"; attendance: Attendance };

const EmployeeAttendanceModal: React.FC<Props> = ({
    isOpen,
    employee,
    employees,
    attendances,
    disableActions = false,
    onClose,
    onCreateAttendance,
    onUpdateAttendance,
    onDeleteAttendance,
}) => {
    const [attendanceModal, setAttendanceModal] = useState<AttendanceModalState>({ type: "none" });

    const employeeAttendances = useMemo(() => {
        if (!employee) return [];
        return attendances
            .filter((attendance) => attendance.employeeId === employee.id)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [attendances, employee]);

    if (!isOpen || !employee) return null;

    const formatHours = (value: number) => value.toFixed(2).replace(".", ",");

    const handleDelete = (attendanceId: number) => {
        const attendance = employeeAttendances.find((a) => a.id === attendanceId);
        const confirmed = window.confirm(
            `Supprimer la présence du ${
                attendance ? attendance.date.toLocaleDateString("fr-FR") : "jour sélectionné"
            } ?`
        );
        if (!confirmed) return;
        onDeleteAttendance(attendanceId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold">Présences — {employee.fullName}</h3>
                        <p className="text-sm text-gray-500">UID : {employee.uniqueId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="self-end p-2 rounded-lg hover:bg-gray-100"
                        aria-label="Fermer"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="flex justify-between items-center mb-3 gap-3">
                    <h4 className="text-lg font-medium">Historique des présences</h4>
                    <button
                        onClick={() => setAttendanceModal({ type: "create" })}
                        disabled={disableActions}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 ${
                            disableActions ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                    >
                        <FaPlus />
                        Nouvelle présence
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
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeAttendances.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                                        Aucune présence enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                employeeAttendances.map((attendance) => (
                                    <tr key={attendance.id} className="border-t">
                                        <td className="px-4 py-3">
                                            {attendance.date.toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-4 py-3">{attendance.clockIn}</td>
                                        <td className="px-4 py-3">{attendance.clockOut}</td>
                                        <td className="px-4 py-3">{attendance.breakDuration}</td>
                                        <td className="px-4 py-3">{formatHours(attendance.workedHours)}</td>
                                        <td className="px-4 py-3">{formatHours(attendance.overtimeHours)}</td>
                                        <td className="px-4 py-3">{attendance.notes}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        setAttendanceModal({ type: "edit", attendance })
                                                    }
                                                    disabled={disableActions}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                    title="Modifier"
                                                >
                                                    <FaPen />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(attendance.id)}
                                                    disabled={disableActions}
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
            </div>

            <AttendanceFormModal
                isOpen={attendanceModal.type !== "none"}
                mode={attendanceModal.type === "edit" ? "edit" : "create"}
                employees={employees}
                initialAttendance={attendanceModal.type === "edit" ? attendanceModal.attendance : undefined}
                defaultEmployeeId={employee.id}
                onClose={() => setAttendanceModal({ type: "none" })}
                onSubmit={(payload) => {
                    if (attendanceModal.type === "edit") {
                        onUpdateAttendance(attendanceModal.attendance.id, payload);
                    } else {
                        onCreateAttendance(payload as AttendanceCreate);
                    }
                }}
            />
        </div>
    );
};

export default EmployeeAttendanceModal;
