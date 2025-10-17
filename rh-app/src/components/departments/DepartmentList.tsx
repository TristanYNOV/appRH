import React, { useMemo, useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import type { Department } from "../../interfaces/department.interface.ts";
import type { Employee } from "../../interfaces/employee.interface.ts";

const emptyEmployees: Employee[] = [];

const createEmptyDepartmentForm = () => ({
    name: "",
    code: "",
    description: "",
});

type Props = {
    departments: Department[];
    onCreate?: (dept: Department) => void;
    onDelete?: (id: number) => void; // optionnel (sinon console.log)
    title?: string;
};

const DepartmentList: React.FC<Props> = ({
    departments,
    onCreate,
    onDelete,
    title = "Departments",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(createEmptyDepartmentForm());

    // Simple générateur d'id (remplace-le par ton backend/DB)
    const nextId = useMemo(() => {
        const max = departments.reduce((m, d) => Math.max(m, d.id), 0);
        return max + 1;
    }, [departments]);

    const resetForm = () => setForm(createEmptyDepartmentForm());

    const handleDelete = (id: number) => {
        if (onDelete) onDelete(id);
        else console.log("Delete department id:", id);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        const now = new Date();
        const newDept: Department = {
            id: nextId,
            name: form.name.trim(),
            code: form.code.trim(),
            description: form.description.trim(),
            employees: emptyEmployees,
            createdAt: now,
            updatedAt: now,
            createdBy: "system", // adapte selon ton contexte
            updatedBy: "system",
        };

        if (onCreate) onCreate(newDept);
        else console.log("Create department:", newDept);

        resetForm();
        setIsOpen(false);
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <button
                    onClick={() => setIsOpen(true)}
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
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3"># Employés</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {departments.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                Aucun département pour le moment.
                            </td>
                        </tr>
                    ) : (
                        departments.map((dept) => (
                            <tr key={dept.id} className="border-t">
                                <td className="px-4 py-3">{dept.id}</td>
                                <td className="px-4 py-3 font-medium">{dept.name}</td>
                                <td className="px-4 py-3">{dept.code}</td>
                                <td className="px-4 py-3">{dept.description}</td>
                                <td className="px-4 py-3">{dept.employees?.length ?? 0}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleDelete(dept.id)}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                            aria-label={`Supprimer ${dept.name}`}
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

            {/* Modal création */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Créer un département</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                                aria-label="Fermer"
                                title="Fermer"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleCreate}>
                            <div>
                                <label className="block text-sm mb-1">Nom</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Informatique"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Code</label>
                                <input
                                    type="text"
                                    required
                                    value={form.code}
                                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                    className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: IT-01"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, description: e.target.value }))
                                    }
                                    className="w-full min-h-[90px] rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brève description du département"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentList;
