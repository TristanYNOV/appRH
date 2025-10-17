import React, { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";

type DepartmentFormValues = {
    name: string;
    code: string;
    description: string;
};

type Props = {
    isOpen: boolean;
    mode: "create" | "update";
    onClose: () => void;
    onSubmit: (values: DepartmentFormValues) => void;
    initialValues?: Partial<DepartmentFormValues>;
    title?: string;
};

const createEmptyDepartmentForm = (): DepartmentFormValues => ({
    name: "",
    code: "",
    description: "",
});

const DepartmentFormModal: React.FC<Props> = ({
    isOpen,
    mode,
    onClose,
    onSubmit,
    initialValues,
    title,
}) => {
    const [form, setForm] = useState<DepartmentFormValues>(createEmptyDepartmentForm());

    useEffect(() => {
        if (!isOpen) return;
        setForm({ ...createEmptyDepartmentForm(), ...initialValues });
    }, [initialValues, isOpen]);

    const computedTitle = useMemo(() => {
        if (title) return title;
        return mode === "create" ? "Créer un département" : "Mettre à jour le département";
    }, [mode, title]);

    const submitLabel = mode === "create" ? "Créer" : "Mettre à jour";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{computedTitle}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer">
                        <FaTimes />
                    </button>
                </div>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(form);
                    }}
                >
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
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="w-full min-h-[90px] rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Brève description du département"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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

export type { DepartmentFormValues };
export default DepartmentFormModal;
