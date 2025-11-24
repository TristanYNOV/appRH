import React, { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { eGender, genderLabel, genderOptions } from "../../../interfaces/employee.codec.ts";
import type { Department } from "../../../interfaces/department.codec.ts";

export type EmployeeFormValues = {
    firstName: string;
    lastName: string;
    gender: eGender;
    email: string;
    phoneNumber: string;
    address: string;
    position: string;
    salary: string;
    hireDate: string;
    departmentName: string;
};

const createEmptyEmployeeForm = (): EmployeeFormValues => ({
    firstName: "",
    lastName: "",
    gender: eGender.MALE,
    email: "",
    phoneNumber: "",
    address: "",
    position: "",
    salary: "",
    hireDate: "",
    departmentName: "",
});

type Props = {
    isOpen: boolean;
    mode: "create" | "update";
    onClose: () => void;
    onSubmit: (values: EmployeeFormValues) => void;
    departments?: Department[];
    initialValues?: Partial<EmployeeFormValues>;
    title?: string;
};

const EmployeeFormModal: React.FC<Props> = ({
    isOpen,
    mode,
    onClose,
    onSubmit,
    departments,
    initialValues,
    title,
}) => {
    const [form, setForm] = useState<EmployeeFormValues>(createEmptyEmployeeForm());

    useEffect(() => {
        if (!isOpen) return;
        setForm({ ...createEmptyEmployeeForm(), ...initialValues });
    }, [isOpen, initialValues]);

    const computedTitle = useMemo(() => {
        if (title) return title;
        return mode === "create" ? "Créer un employé" : "Mettre à jour l'employé";
    }, [mode, title]);

    const submitLabel = mode === "create" ? "Créer" : "Mettre à jour";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{computedTitle}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer">
                        <FaTimes />
                    </button>
                </div>

                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(form);
                    }}
                >
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
                                <option key={g} value={g}>
                                    {genderLabel[g]}
                                </option>
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
                            value={form.phoneNumber}
                            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
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
                            value={form.departmentName}
                            onChange={(e) => setForm((f) => ({ ...f, departmentName: e.target.value }))}
                            required
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">— Choisir —</option>
                            {departments?.map((d) => (
                                <option key={d.id} value={d.name}>
                                    {d.name} ({d.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;
