import { useState } from 'react';
import { Monitor, Command, AppWindow } from 'lucide-react';
import { motion } from 'framer-motion';

interface OSSelectionProps {
    onSelect: (os: 'macos' | 'windows') => void;
}

export function OSSelection({ onSelect }: OSSelectionProps) {
    const [selected, setSelected] = useState<'macos' | 'windows' | null>(null);

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full text-center"
            >
                <h2 className="text-3xl font-bold text-black mb-2">Select Your System</h2>
                <p className="text-gray-500 mb-12">Orbit VM needs to optimize its storage engine for your host OS.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* MacOS Option */}
                    <button
                        onClick={() => setSelected('macos')}
                        className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 ${selected === 'macos'
                                ? 'border-black bg-black text-white shadow-xl scale-105'
                                : 'border-gray-100 bg-white text-gray-900 hover:border-gray-200 hover:shadow-lg'
                            }`}
                    >
                        <div className="absolute top-4 right-4">
                            <div className={`w-4 h-4 rounded-full border ${selected === 'macos' ? 'border-white bg-white' : 'border-gray-300'
                                }`} />
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${selected === 'macos' ? 'bg-white/10' : 'bg-gray-50'
                                }`}>
                                <Command size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">macOS</h3>
                            <p className={`text-sm ${selected === 'macos' ? 'text-gray-300' : 'text-gray-500'}`}>
                                Optimized for Apple Silicon & HVF
                            </p>
                        </div>
                    </button>

                    {/* Windows Option */}
                    <button
                        onClick={() => setSelected('windows')}
                        className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 ${selected === 'windows'
                                ? 'border-black bg-black text-white shadow-xl scale-105'
                                : 'border-gray-100 bg-white text-gray-900 hover:border-gray-200 hover:shadow-lg'
                            }`}
                    >
                        <div className="absolute top-4 right-4">
                            <div className={`w-4 h-4 rounded-full border ${selected === 'windows' ? 'border-white bg-white' : 'border-gray-300'
                                }`} />
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${selected === 'windows' ? 'bg-white/10' : 'bg-gray-50'
                                }`}>
                                <AppWindow size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Windows</h3>
                            <p className={`text-sm ${selected === 'windows' ? 'text-gray-300' : 'text-gray-500'}`}>
                                Optimized for WHPX & x86_64
                            </p>
                        </div>
                    </button>
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!selected}
                    className="px-8 py-3 bg-black text-white rounded-xl font-medium text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </motion.div>
        </div>
    );
}
