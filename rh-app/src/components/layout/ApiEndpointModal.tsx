import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ApiEndpointModalProps {
    isOpen: boolean;
    currentUrl: string;
    defaultUrl: string;
    isSubmitting: boolean;
    error?: string | null;
    onClose: () => void;
    onSave: (url: string) => void;
    onUrlChange?: () => void;
}

const ApiEndpointModal: React.FC<ApiEndpointModalProps> = ({
    isOpen,
    currentUrl,
    defaultUrl,
    isSubmitting,
    error,
    onClose,
    onSave,
    onUrlChange,
}) => {
    const [url, setUrl] = useState(currentUrl);

    useEffect(() => {
        if (isOpen) {
            setUrl(currentUrl);
        }
    }, [isOpen, currentUrl]);

    if (!isOpen) return null;

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSave(url);
    };

    const handleChange = (value: string) => {
        setUrl(value);
        onUrlChange?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Configurer l'adresse de l'API</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Fermer">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="api-base-url">
                            Adresse de l'API
                        </label>
                        <input
                            id="api-base-url"
                            type="text"
                            value={url}
                            onChange={(event) => handleChange(event.target.value)}
                            disabled={isSubmitting}
                            placeholder="http://localhost:5171/api"
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            L'application utilisera cette adresse pour contacter le serveur. Assurez-vous qu'elle est
                            accessible depuis votre navigateur.
                        </p>
                        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => handleChange(defaultUrl)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                            disabled={isSubmitting}
                        >
                            Réinitialiser
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                disabled={isSubmitting || url.trim().length === 0}
                            >
                                {isSubmitting ? "Vérification…" : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApiEndpointModal;
