import React from "react";
import { FaSignInAlt, FaSignOutAlt, FaSync, FaCog } from "react-icons/fa";

interface TopBarProps {
    logIn: boolean;
    onOpenAuth: (mode: "login" | "signup") => void;
    onLogout: () => void;
    onReconnect: () => void;
    canReconnect: boolean;
    isReconnecting: boolean;
    hasApiIssue: boolean;
    onOpenApiSettings: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
    logIn,
    onOpenAuth,
    onLogout,
    onReconnect,
    canReconnect,
    isReconnecting,
    hasApiIssue,
    onOpenApiSettings,
}) => (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">RH - Application</h1>
            <button
                type="button"
                onClick={onOpenApiSettings}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
                <FaCog />
                <span className="hidden sm:block">Configurer l&apos;API</span>
            </button>
            <button
                type="button"
                onClick={onReconnect}
                disabled={!canReconnect || isReconnecting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    hasApiIssue
                        ? "border-amber-500 bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "border-emerald-500 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                } ${
                    !canReconnect || isReconnecting ? "opacity-60 cursor-not-allowed" : ""
                }`}
            >
                <FaSync className={isReconnecting ? "animate-spin" : ""} />
                <span className="hidden sm:block">{hasApiIssue ? "Reconnexion API" : "Vérifier l'API"}</span>
            </button>
        </div>

        <div className="flex items-center gap-3">
            {!logIn ? (
                <button
                    onClick={() => onOpenAuth("login")}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <FaSignInAlt />
                    <span className="hidden sm:block">Se connecter</span>
                </button>
            ) : (
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                >
                    <FaSignOutAlt />
                    <span className="hidden sm:block">Se déconnecter</span>
                </button>
            )}
        </div>
    </nav>
);

export default TopBar;
