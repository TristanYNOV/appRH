import React, { useMemo, useState } from "react";

import type { AuthLoginPayload, AuthRegisterPayload } from "../../interfaces/auth.interface.ts";

interface AuthFormProps {
    onLogin: (payload: AuthLoginPayload) => void;
    onRegister: (payload: AuthRegisterPayload) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const isSignup = useMemo(() => mode === "signup", [mode]);

    const resetFormError = () => setFormError(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resetFormError();

        if (!isSignup) {
            onLogin({ email, password });
            return;
        }

        if (!employeeId) {
            setFormError("L'identifiant employé est requis.");
            return;
        }

        const parsedEmployeeId = Number(employeeId);
        if (Number.isNaN(parsedEmployeeId)) {
            setFormError("L'identifiant employé doit être un nombre.");
            return;
        }

        if (password !== confirmPassword) {
            setFormError("Les mots de passe ne correspondent pas.");
            return;
        }

        onRegister({
            firstName,
            lastName,
            email,
            userName,
            password,
            confirmPassword,
            employeeId: parsedEmployeeId,
        });
    };

    const switchMode = (nextMode: "login" | "signup") => {
        setMode(nextMode);
        resetFormError();
    };

    return (
        <div className="max-w-lg mx-auto mt-20 p-6 border border-gray-200 rounded-2xl shadow-md bg-white">
            <h2 className="text-2xl font-semibold text-center mb-4">
                {isSignup ? "Inscription" : "Connexion"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {isSignup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Nom d'utilisateur"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                        />
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {isSignup && (
                    <input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="Identifiant employé"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {isSignup && (
                    <input
                        type="password"
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}

                {formError && (
                    <p className="text-red-600 text-sm text-center" role="alert">
                        {formError}
                    </p>
                )}

                <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
                >
                    {isSignup ? "Créer un compte" : "Se connecter"}
                </button>
            </form>

            <p className="text-center text-sm mt-4 text-gray-600">
                {!isSignup ? (
                    <>
                        Pas encore de compte ?{" "}
                        <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() => switchMode("signup")}
                        >
                            S’inscrire
                        </button>
                    </>
                ) : (
                    <>
                        Déjà inscrit ?{" "}
                        <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() => switchMode("login")}
                        >
                            Se connecter
                        </button>
                    </>
                )}
            </p>
        </div>
    );
};

export default AuthForm;
