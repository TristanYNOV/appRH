import { useMemo, useState } from "react";
import { FaCalendarPlus, FaPen, FaTrash } from "react-icons/fa";

import AttendanceFormModal from "./AttendanceFormModal.tsx";
import type {
    Attendance,
    AttendanceCreate,
    AttendanceUpdate,
} from "../../interfaces/attendance.codec.ts";
import type { Employee } from "../../interfaces/employee.codec.ts";

type ModalState =
    | { type: "none" }
    | { type: "create" }
    | { type: "edit"; attendance: Attendance };

type Props = {
    attendances: Attendance[];
    employees: Employee[];
    isLoading?: boolean;
    disableActions?: boolean;
    onCreate: (payload: AttendanceCreate) => void;
    onUpdate: (id: number, payload: AttendanceUpdate) => void;
    onDelete: (id: number) => void;
};

const AttendanceList = ({
    attendances,
    employees,
    isLoading = false,
    disableActions = false,
    onCreate,
    onUpdate,
    onDelete,
}: Props) => {
    const [modal, setModal] = useState<ModalState>({ type: "none" });

    const sortedAttendances = useMemo(
        () =>
            [...attendances].sort(
                (a, b) => b.date.getTime() - a.date.getTime() || b.id - a.id
            ),
        [attendances]
    );

    const formatHours = (value: number) => value.toFixed(2).replace(".", ",");

    const handleDelete = (attendance: Attendance) => {
        const confirmed = window.confirm(
            `Supprimer la présence du ${new Date(attendance.date).toLocaleDateString("fr-FR")}?`
        );
        if (!confirmed) return;
        onDelete(attendance.id);
    };

    const tableContent = useMemo(() => {
        if (isLoading) {
            return (
                <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                        Chargement des présences…
                    </td>
                </tr>
            );
        }

        if (sortedAttendances.length === 0) {
            return (
                <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                        Aucune présence enregistrée.
                    </td>
                </tr>
            );
        }

        return sortedAttendances.map((attendance) => (
            <tr key={attendance.id} className="border-t">
                <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(attendance.date).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">{attendance.employeeName}</td>
                <td className="px-4 py-3 font-mono">{attendance.clockIn}</td>
                <td className="px-4 py-3 font-mono">{attendance.clockOut}</td>
                <td className="px-4 py-3 font-mono">{attendance.breakDuration}</td>
                <td className="px-4 py-3">{formatHours(attendance.workedHours)}</td>
                <td className="px-4 py-3">{formatHours(attendance.overtimeHours)}</td>
                <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setModal({ type: "edit", attendance })}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100"
                            disabled={disableActions}
                            title="Modifier"
                        >
                            <FaPen />
                        </button>
                        <button
                            onClick={() => handleDelete(attendance)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            disabled={disableActions}
                            title="Supprimer"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }, [disableActions, handleDelete, isLoading, sortedAttendances]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-2xl font-semibold">Liste des présences</h2>
                <button
                    onClick={() => setModal({ type: "create" })}
                    disabled={disableActions}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 ${
                        disableActions ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                >
                    <FaCalendarPlus />
                    Nouvelle présence
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Employé</th>
                            <th className="px-4 py-3">Arrivée</th>
                            <th className="px-4 py-3">Départ</th>
                            <th className="px-4 py-3">Pause</th>
                            <th className="px-4 py-3">Heures</th>
                            <th className="px-4 py-3">Heures sup.</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>{tableContent}</tbody>
                </table>
            </div>

            <AttendanceFormModal
                isOpen={modal.type !== "none"}
                mode={modal.type === "edit" ? "edit" : "create"}
                employees={employees}
                onClose={() => setModal({ type: "none" })}
                onSubmit={(payload) => {
                    if (modal.type === "edit") {
                        onUpdate(modal.attendance.id, payload);
                    } else {
                        onCreate(payload as AttendanceCreate);
                    }
                }}
                initialAttendance={modal.type === "edit" ? modal.attendance : undefined}
            />
        </div>
    );
};

export default AttendanceList;
