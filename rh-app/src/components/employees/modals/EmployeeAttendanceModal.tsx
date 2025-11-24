import React from "react";
import { FaTimes } from "react-icons/fa";
import type { Employee } from "../../../interfaces/employee.codec.ts";

type Props = {
    isOpen: boolean;
    employee: Employee | undefined;
    onClose: () => void;
};

const EmployeeAttendanceModal: React.FC<Props> = ({ isOpen, employee, onClose }) => {
    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                        Présences — {employee.lastName} {employee.firstName}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer">
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
                            {(employee.attendances ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        Aucune présence enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                (employee.attendances ?? []).map((attendance) => (
                                    <tr key={attendance.id} className="border-t">
                                        <td className="px-4 py-3">
                                            {attendance.dateTime
                                                ? attendance.dateTime.toLocaleDateString("fr-FR")
                                                : new Date(attendance.dateTime).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-4 py-3">{attendance.clockIn}</td>
                                        <td className="px-4 py-3">{attendance.clockOut}</td>
                                        <td className="px-4 py-3">{attendance.breakDuration}</td>
                                        <td className="px-4 py-3">{attendance.workedHour}</td>
                                        <td className="px-4 py-3">{attendance.overtimeHours}</td>
                                        <td className="px-4 py-3">{attendance.notes}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAttendanceModal;
