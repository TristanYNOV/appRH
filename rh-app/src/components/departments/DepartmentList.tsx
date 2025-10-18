import React, { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrash, FaPen } from "react-icons/fa";
import type { Department } from "../../interfaces/department.interface.ts";
import type { Employee } from "../../interfaces/employee.interface.ts";
import DepartmentFormModal, {
    type DepartmentFormValues,
} from "./modals/DepartmentFormModal.tsx";

const emptyEmployees: Employee[] = [];

type Props = {
    departments: Department[];
    onCreate?: (dept: Department) => void;
    onUpdate?: (dept: Department) => void;
    onDelete?: (id: number) => void;
    isLoading?: boolean;
    actionsDisabled?: boolean;
    title?: string;
};

const DepartmentList: React.FC<Props> = ({
    departments,
    onCreate,
    onUpdate,
    onDelete,
    isLoading = false,
    actionsDisabled = false,
    title = "Departments",
}) => {
    const [modal, setModal] = useState<
        { mode: "create" } | { mode: "update"; departmentId: number }
    >();

    useEffect(() => {
        if (actionsDisabled) {
            setModal(undefined);
        }
    }, [actionsDisabled]);

    const nextId = useMemo(() => {
        const max = departments.reduce((m, d) => Math.max(m, d.id), 0);
        return max + 1;
    }, [departments]);

    const selectedDepartment = useMemo(() => {
        if (!modal || modal.mode !== "update") return undefined;
        return departments.find((department) => department.id === modal.departmentId);
    }, [modal, departments]);

    const initialValues: Partial<DepartmentFormValues> | undefined = useMemo(() => {
        if (!selectedDepartment) return undefined;
        return {
            name: selectedDepartment.name ?? "",
            code: selectedDepartment.code ?? "",
            description: selectedDepartment.description ?? "",
        };
    }, [selectedDepartment]);

    const handleDelete = (id: number) => {
        if (onDelete) onDelete(id);
        else console.log("Delete department id:", id);
    };

    const handleSubmit = (values: DepartmentFormValues) => {
        const now = new Date();
        if (!modal || modal.mode === "create") {
            const newDept: Department = {
                id: nextId,
                name: values.name.trim(),
                code: values.code.trim(),
                description: values.description.trim(),
                employees: emptyEmployees,
                createdAt: now,
                updatedAt: now,
                createdBy: "system",
                updatedBy: "system",
            };

            if (onCreate) onCreate(newDept);
            else console.log("Create department:", newDept);
        } else if (modal.mode === "update" && selectedDepartment) {
            const updatedDept: Department = {
                ...selectedDepartment,
                name: values.name.trim(),
                code: values.code.trim(),
                description: values.description.trim(),
                updatedAt: now,
                updatedBy: "system",
            };

            if (onUpdate) onUpdate(updatedDept);
            else console.log("Update department:", updatedDept);
        }

        setModal(undefined);
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <button
                    onClick={() => {
                        if (actionsDisabled) return;
                        setModal({ mode: "create" });
                    }}
                    disabled={actionsDisabled}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50${
                        actionsDisabled ? " opacity-60 cursor-not-allowed" : ""
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
                            <th className="px-4 py-3">Nom</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3"># Employés</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                    Chargement des départements…
                                </td>
                            </tr>
                        ) : departments.length === 0 ? (
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
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    if (actionsDisabled) return;
                                                    setModal({ mode: "update", departmentId: dept.id });
                                                }}
                                                disabled={actionsDisabled}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100${
                                                    actionsDisabled ? " opacity-60 cursor-not-allowed" : ""
                                                }`}
                                                aria-label={`Modifier ${dept.name}`}
                                                title="Modifier"
                                            >
                                                <FaPen />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (actionsDisabled) return;
                                                    handleDelete(dept.id);
                                                }}
                                                disabled={actionsDisabled}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100${
                                                    actionsDisabled ? " opacity-60 cursor-not-allowed" : ""
                                                }`}
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

            <DepartmentFormModal
                isOpen={Boolean(modal)}
                mode={modal?.mode ?? "create"}
                onClose={() => setModal(undefined)}
                onSubmit={handleSubmit}
                initialValues={initialValues}
            />
        </div>
    );
};

export default DepartmentList;
