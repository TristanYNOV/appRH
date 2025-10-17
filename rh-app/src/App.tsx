import { useEffect, useRef, useState } from "react";
import "./App.css";
import { AuthForm, DepartmentList, EmployeeList, TopBar } from "./components/index.ts";
import { mockedDepartments as initialMockDepartments } from "./mocks/mockDepartment.ts";
import { mockedEmployees as initialMockEmployees } from "./mocks/mockEmployees.ts";

import type { LeaveRequest } from "./interfaces/leaveRequest.interface.ts";
import type { Employee } from "./interfaces/employee.interface.ts";
import type { Department } from "./interfaces/department.interface.ts";
import { Toaster, toast } from "react-hot-toast";

function App() {
    const [logIn, setLogIn] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
    const [displayMode, setDisplayMode] = useState<"employee" | "department">("employee");

    const [employees, setEmployees] = useState<Employee[]>(initialMockEmployees);
    const [departments, setDepartments] = useState<Department[]>(initialMockDepartments);

    // Optionnel: si certains enfants gardent un état interne, on peut forcer un re-mount
    const [refreshKey, setRefreshKey] = useState(0);
    const bumpRefresh = () => setRefreshKey((k) => k + 1);

    // --------- Auth ----------
    const handleAuth = (email: string, password: string, mode: "login" | "signup") => {
        console.log("Auth:", { email, password, mode });
        setLogIn(true);
        setAuthMode(null);
    };

    // --------- Employees CRUD ----------
    const handleCreate = (emp: Employee) => {
        setEmployees((prev) => [...prev, emp]);
        bumpRefresh();
    };

    const handleDelete = (id: number) => {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        bumpRefresh();
    };

    const handleCreateLeaveRequest = (employeeId: number, leave: LeaveRequest) => {
        setEmployees((prev) =>
            prev.map((e) =>
                e.id === employeeId
                    ? { ...e, leaveRequests: [...(e.leaveRequests ?? []), leave] }
                    : e
            )
        );
        bumpRefresh();
    };

    // --------- IMPORT / EXPORT (placeholder API) ----------
    // Inputs fichiers cachés
    const empFileInputRef = useRef<HTMLInputElement | null>(null);
    const deptFileInputRef = useRef<HTMLInputElement | null>(null);

    const triggerEmployeeImport = () => empFileInputRef.current?.click();
    const triggerDepartmentImport = () => deptFileInputRef.current?.click();

    // Utilitaire pour logguer quelques infos utiles sur le fichier
    const logFileInfo = async (file: File) => {
        console.log("[IMPORT] Fichier:", {
            name: file.name,
            size: `${file.size} bytes`,
            type: file.type || "(no mime type)",
            lastModified: new Date(file.lastModified).toISOString(),
        });

        try {
            // Optionnel: lire quelques octets (debug)
            const buf = await file.slice(0, 16).arrayBuffer();
            const bytes = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0"));
            console.log("[IMPORT] Premiers octets (hex):", bytes.join(" "));
        } catch (e) {
            console.warn("[IMPORT] Impossible de lire l’aperçu binaire:", e);
        }
    };

    // Import Employés: on ne fait que logger
    const onImportEmployees = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // reset pour pouvoir re-sélectionner le même fichier plus tard
        if (!file) return;
        await logFileInfo(file);
        toast.success("Fichier employés sélectionné (voir console)");
        // 👉 Plus tard : appeler ton API d'import
    };

    // Import Départements: on ne fait que logger
    const onImportDepartments = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        await logFileInfo(file);
        toast.success("Fichier départements sélectionné (voir console)");
        // 👉 Plus tard : appeler ton API d'import
    };

    // Export (placeholder) : on log seulement l'intention pour l’instant
    const exportEmployees = () => {
        console.log("[EXPORT] Demande d’export des employés (à déléguer à l’API).", {
            count: employees.length,
        });
        toast("Export employés demandé (API à venir)");
    };

    const exportDepartments = () => {
        console.log("[EXPORT] Demande d’export des départements (à déléguer à l’API).", {
            count: departments.length,
        });
        toast("Export départements demandé (API à venir)");
    };

    // Exemple de useEffect de “resync” (à compléter quand l’API sera branchée)
    useEffect(() => {
        // TODO: Add All Get To download
    }, [refreshKey]);

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar logIn={logIn} setLogIn={setLogIn} onOpenAuth={setAuthMode} />

            {!logIn && authMode === null && (
                <div className="flex flex-col justify-center w-full h-80 items-center">
                    <span className="text-center">Merci de vous authentifier !</span>
                    <div className="flex gap-4 mt-8">
                        <span className="text-center">Email:</span>
                        <span className="text-center">Graou@minou.miaou</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-center">Mot de passse:</span>
                        <span className="text-center">Graou</span>
                    </div>
                </div>
            )}

            {!logIn && authMode && <AuthForm onSubmit={handleAuth} />}

            {logIn && (
                <div className="flex flex-col gap-2 mt-4">
                    {/* --- Barre d’actions Import/Export (auth only) --- */}
                    <div className="flex flex-wrap justify-center gap-3 mt-4 px-4">
                        <button
                            onClick={triggerEmployeeImport}
                            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                            title="Importer Excel employés"
                        >
                            Importer Excel — Employés
                        </button>
                        <button
                            onClick={triggerDepartmentImport}
                            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                            title="Importer Excel départements"
                        >
                            Importer Excel — Départements
                        </button>
                        <button
                            onClick={exportEmployees}
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Exporter les employés"
                        >
                            Exporter Excel — Employés
                        </button>
                        <button
                            onClick={exportDepartments}
                            className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                            title="Exporter les départements"
                        >
                            Exporter Excel — Départements
                        </button>

                        {/* Inputs fichiers cachés */}
                        <input
                            ref={empFileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={onImportEmployees}
                        />
                        <input
                            ref={deptFileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={onImportDepartments}
                        />
                    </div>
                    <div className="flex w-full justify-center gap-2 mt-16">
                        <button
                            className="btn flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                            onClick={() => setDisplayMode("department")}
                            disabled={displayMode === "department"}
                        >
                            Voir les départements
                        </button>
                        <button
                            onClick={() => setDisplayMode("employee")}
                            className="btn flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                            disabled={displayMode === "employee"}
                        >
                            Voir les employées
                        </button>
                    </div>

                    {/* --- Contenu --- */}
                    <div className="flex flex-col overflow-y-auto gap-4">
                        {displayMode === "department" && (
                            <DepartmentList key={`dept-${refreshKey}`} departments={departments} />
                        )}
                        {displayMode === "employee" && (
                            <EmployeeList
                                key={`emp-${refreshKey}`}
                                title="Liste des employés"
                                employees={employees}
                                departments={departments}
                                onCreate={handleCreate}
                                onDelete={handleDelete}
                                onCreateLeaveRequest={handleCreateLeaveRequest}
                            />
                        )}
                    </div>
                </div>
            )}

            <Toaster position="top-center" />
        </div>
    );
}

export default App;
