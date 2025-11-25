import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { FaTimes } from "react-icons/fa";

import type { Attendance, AttendanceCreate, AttendanceUpdate } from "../../interfaces/attendance.codec.ts";
import type { Employee } from "../../interfaces/employee.codec.ts";

export type AttendanceFormValues = {
    date: string;
    clockIn: string;
    clockOut: string;
    breakDuration: string;
    notes: string;
    employeeId: string;
};

type Props = {
    isOpen: boolean;
    mode: "create" | "edit";
    employees: Employee[];
    onClose: () => void;
    onSubmit: (payload: AttendanceCreate | AttendanceUpdate) => void;
    initialAttendance?: Attendance;
    defaultEmployeeId?: number;
};

const toDateLocal = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().slice(0, 10);
};

const timeToSeconds = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
};

const AttendanceFormModal = ({
    isOpen,
    mode,
    employees,
    onClose,
    onSubmit,
    initialAttendance,
    defaultEmployeeId,
}: Props) => {
    const initialValues = useMemo<AttendanceFormValues>(() => {
        if (initialAttendance) {
            return {
                date: toDateLocal(initialAttendance.date),
                clockIn: initialAttendance.clockIn,
                clockOut: initialAttendance.clockOut,
                breakDuration: initialAttendance.breakDuration,
                notes: initialAttendance.notes ?? "",
                employeeId: String(initialAttendance.employeeId ?? defaultEmployeeId ?? ""),
            };
        }

        return {
            date: toDateLocal(new Date()),
            clockIn: "09:00:00",
            clockOut: "17:00:00",
            breakDuration: "01:00:00",
            notes: "",
            employeeId: String(defaultEmployeeId ?? ""),
        };
    }, [defaultEmployeeId, initialAttendance]);

    const [values, setValues] = useState<AttendanceFormValues>(initialValues);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setValues(initialValues);
    }, [initialValues]);

    if (!isOpen) return null;

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const arrival = timeToSeconds(values.clockIn);
        const departure = timeToSeconds(values.clockOut);

        if (departure <= arrival) {
            setError("L'heure de départ doit être postérieure à l'heure d'arrivée.");
            return;
        }

        setError(null);
        const sanitizedNotes = values.notes.trim();

        const payload: AttendanceCreate | AttendanceUpdate = {
            date: new Date(values.date).toISOString(),
            clockIn: values.clockIn,
            clockOut: values.clockOut,
            breakDuration: values.breakDuration,
            employeeId: Number(values.employeeId),
        };

        if (sanitizedNotes !== "") {
            payload.notes = sanitizedNotes;
        } else if (mode === "edit") {
            // Allow clearing an existing note when updating
            payload.notes = null;
        }

        onSubmit(payload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">
                        {mode === "create" ? "Nouvelle présence" : "Modifier la présence"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100"
                        aria-label="Fermer"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm">
                        <span>Date</span>
                        <input
                            type="date"
                            name="date"
                            value={values.date}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm">
                        <span>Employé</span>
                        <select
                            name="employeeId"
                            value={values.employeeId}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="" disabled>
                                Sélectionner un employé
                            </option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.fullName} ({employee.uniqueId})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="flex flex-col gap-2 text-sm">
                        <span>Arrivée</span>
                        <input
                            type="time"
                            step="1"
                            name="clockIn"
                            value={values.clockIn}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm">
                        <span>Départ</span>
                        <input
                            type="time"
                            step="1"
                            name="clockOut"
                            value={values.clockOut}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm">
                        <span>Durée de pause</span>
                        <input
                            type="time"
                            step="1"
                            name="breakDuration"
                            value={values.breakDuration}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm md:col-span-2">
                        <span>Notes</span>
                        <textarea
                            name="notes"
                            value={values.notes}
                            onChange={handleChange}
                            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Commentaires éventuels"
                        />
                    </label>

                    {error && (
                        <div className="md:col-span-2 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 md:col-span-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {mode === "create" ? "Créer" : "Mettre à jour"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttendanceFormModal;
