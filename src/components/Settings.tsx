import { useState } from 'react';
import { X, Cpu, MemoryStick, HardDrive, FolderOpen } from 'lucide-react';

interface SettingsProps {
    onClose: () => void;
}

interface AppSettings {
    defaultCpuCores: number;
    defaultRamMb: number;
    defaultDiskGb: number;
    vmsDirectory: string;
}

export function Settings({ onClose }: SettingsProps) {
    const [settings, setSettings] = useState<AppSettings>({
        defaultCpuCores: 2,
        defaultRamMb: 2048,
        defaultDiskGb: 20,
        vmsDirectory: '~/.config/orbit-vm',
    });

    const handleSave = () => {
        localStorage.setItem('orbit-settings', JSON.stringify(settings));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Default VM Settings</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Cpu size={16} />
                                    <span>CPU Cores</span>
                                </div>
                                <select
                                    value={settings.defaultCpuCores}
                                    onChange={(e) => setSettings({ ...settings, defaultCpuCores: Number(e.target.value) })}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    {[1, 2, 4, 6, 8].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MemoryStick size={16} />
                                    <span>RAM</span>
                                </div>
                                <select
                                    value={settings.defaultRamMb}
                                    onChange={(e) => setSettings({ ...settings, defaultRamMb: Number(e.target.value) })}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    {[1024, 2048, 4096, 8192, 16384].map(n => (
                                        <option key={n} value={n}>{n / 1024} GB</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <HardDrive size={16} />
                                    <span>Disk Size</span>
                                </div>
                                <select
                                    value={settings.defaultDiskGb}
                                    onChange={(e) => setSettings({ ...settings, defaultDiskGb: Number(e.target.value) })}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    {[10, 20, 40, 60, 100].map(n => (
                                        <option key={n} value={n}>{n} GB</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Storage</h3>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-gray-700">
                                <FolderOpen size={16} />
                            </div>
                            <input
                                type="text"
                                value={settings.vmsDirectory}
                                onChange={(e) => setSettings({ ...settings, vmsDirectory: e.target.value })}
                                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-5 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
