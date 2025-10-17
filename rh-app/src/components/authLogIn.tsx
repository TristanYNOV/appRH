import React, { useState } from "react";

interface AuthFormProps {
    onSubmit: (email: string, password: string, mode: "login" | "signup") => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit }) => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email, password, mode);
    };

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border border-gray-200 rounded-2xl shadow-md bg-white">
            <h2 className="text-2xl font-semibold text-center mb-4">
                {mode === "login" ? "Connexion" : "Inscription"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Adresse e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition"
                >
                    {mode === "login" ? "Se connecter" : "Créer un compte"}
                </button>
            </form>

            <p className="text-center text-sm mt-4 text-gray-600">
                {mode === "login" ? (
                    <>
                        Pas encore de compte ?{" "}
                        <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() => setMode("signup")}
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
                            onClick={() => setMode("login")}
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
