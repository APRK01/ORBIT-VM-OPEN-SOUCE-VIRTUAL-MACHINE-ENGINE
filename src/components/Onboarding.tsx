import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [installing, setInstalling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInstall = async () => {
        setInstalling(true);
        setError(null);
        try {
            await invoke<string>('install_qemu');
            onComplete();
        } catch (e) {
            setError(String(e));
            setInstalling(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="max-w-md w-full mx-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-black" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">QEMU Not Found</h1>
                    <p className="text-gray-600 text-sm">
                        Orbit VM requires QEMU to run virtual machines. Install it via Homebrew to continue.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {installing ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Installing QEMU...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Install QEMU via Homebrew
                        </>
                    )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                    This will run: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">brew install qemu</code>
                </p>
            </div>
        </div>
    );
}
