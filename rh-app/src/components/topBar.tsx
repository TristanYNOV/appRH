import React from "react";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

interface TopBarProps {
    logIn: boolean;
    setLogIn: React.Dispatch<React.SetStateAction<boolean>>;
    onOpenAuth: (mode: "login" | "signup") => void;
}

const TopBar: React.FC<TopBarProps> = ({ logIn, setLogIn, onOpenAuth }) => {
    return (
        <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
                RH - Application
            </h1>

            <div className="flex items-center gap-3">
                {!logIn ? (
                        <button
                            onClick={() => onOpenAuth("login")}
                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <FaSignInAlt />
                            Se connecter
                        </button>
                ) : (
                    <button
                        onClick={() => setLogIn(false)}
                        className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        <FaSignOutAlt />
                        Se déconnecter
                    </button>
                )}
            </div>
        </nav>
    );
};

export default TopBar;
