import { useState } from "react";
import "./App.css";
import AuthForm from "./components/authLogIn.tsx";
import TopBar from "./components/topBar.tsx";
import Departments from "./components/Department.component.tsx";
import {mockedDepartments} from "./mocks/mockDepartment.ts";
import {mockedEmployees} from "./mocks/mockEmployees.ts";
import Employees from "./components/Employee.tsx";
import type {LeaveRequest} from "./interfaces/leaveRequest.interface.ts";
import type {Employee} from "./interfaces/employee.interface.ts";

function App() {
    const [logIn, setLogIn] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
    const [displayMode, setDisplayMode] = useState<"employee" | "department">('employee');

    const handleAuth = (email: string, password: string, mode: "login" | "signup") => {
        console.log(email, password, mode);
        setLogIn(true);
        setAuthMode(null);
    };
    const [employees, setEmployees] = useState(mockedEmployees);


    const handleCreate = (emp: Employee) => {
        setEmployees((prev) => [...prev, emp]);
    };

    const handleDelete = (id: number) => {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
    };

    const handleCreateLeaveRequest = (employeeId: number, leave: LeaveRequest) => {
        setEmployees((prev) =>
            prev.map((e) =>
                e.id === employeeId
                    ? { ...e, leaveRequests: [...(e.leaveRequests ?? []), leave] }
                    : e
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar logIn={logIn} setLogIn={setLogIn} onOpenAuth={setAuthMode} />

            { !logIn && authMode === null && (
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

            {!logIn && authMode && (
                <AuthForm onSubmit={handleAuth}/>
            )}

            {
                logIn && (
                    <>
                        <div className="flex w-full justify-center gap-2 pt-4">
                            <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                                    onClick={() => setDisplayMode('department')}>
                                Voir les départements
                            </button>
                            <button onClick={() => setDisplayMode('employee')}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition">
                                Voir les employées
                            </button>
                        </div>
                        <div className="flex flex-col overflow-y-auto gap-4">
                            { displayMode === 'department' &&
                                <Departments departments={mockedDepartments}/>
                            }
                            {
                                displayMode === 'employee' &&
                                <Employees
                                    title="Liste des employés"
                                    employees={employees}
                                    departments={mockedDepartments}
                                    onCreate={handleCreate}
                                    onDelete={handleDelete}
                                    onCreateLeaveRequest={handleCreateLeaveRequest}
                                />
                            }
                        </div>
                    </>
                )
            }
        </div>
    );
}

export default App;
