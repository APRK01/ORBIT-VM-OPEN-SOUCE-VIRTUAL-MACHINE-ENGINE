import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { X, HardDrive, Cpu, MemoryStick, Disc, FolderOpen } from 'lucide-react';
import { VMConfig } from '../types';

interface CreateVMWizardProps {
    spaceId: string;
    onClose: () => void;
    onCreated: (vm: VMConfig) => void;
}

export function CreateVMWizard({ spaceId, onClose, onCreated }: CreateVMWizardProps) {
    const [name, setName] = useState('');
    const [cpuCores, setCpuCores] = useState(2);
    const [ramMb, setRamMb] = useState(2048);
    const [diskSizeGb, setDiskSizeGb] = useState(20);
    const [isoPath, setIsoPath] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBrowseISO = async () => {
        try {
            const selected = await open({
                multiple: false,
                filters: [{ name: 'ISO Image', extensions: ['iso'] }],
                title: 'Select ISO Image',
            });
            if (selected) {
                setIsoPath(selected as string);
            }
        } catch (e) {
            console.error('Failed to open file dialog:', e);
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Please enter a VM name');
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const homeDir = await invoke<string>('get_home_dir').catch(() => '/Users/user');
            const diskPath = `${homeDir}/.config/orbit-vm/disks/${name.toLowerCase().replace(/\s+/g, '-')}.qcow2`;

            await invoke('create_disk_image', {
                path: diskPath,
                sizeGb: diskSizeGb
            });

            const vmConfig: VMConfig = {
                id: crypto.randomUUID(),
                name,
                spaceId,
                cpuCores,
                ramMb,
                diskPath,
                isoPath: isoPath || undefined,
                arch: 'aarch64',
                status: 'stopped',
            };

            await invoke('create_vm', { config: vmConfig });
            onCreated(vmConfig);
            onClose();
        } catch (e) {
            setError(String(e));
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Create New VM</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">VM Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Ubuntu Server"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <Cpu size={14} /> CPU Cores
                            </label>
                            <select
                                value={cpuCores}
                                onChange={(e) => setCpuCores(Number(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                {[1, 2, 4, 6, 8].map(n => (
                                    <option key={n} value={n}>{n} Core{n > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <MemoryStick size={14} /> RAM
                            </label>
                            <select
                                value={ramMb}
                                onChange={(e) => setRamMb(Number(e.target.value))}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                {[1024, 2048, 4096, 8192, 16384].map(n => (
                                    <option key={n} value={n}>{n / 1024} GB</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                            <HardDrive size={14} /> Disk Size
                        </label>
                        <select
                            value={diskSizeGb}
                            onChange={(e) => setDiskSizeGb(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {[10, 20, 40, 60, 100, 200].map(n => (
                                <option key={n} value={n}>{n} GB</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                            <Disc size={14} /> ISO Image (Optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={isoPath}
                                onChange={(e) => setIsoPath(e.target.value)}
                                placeholder="No ISO selected"
                                readOnly
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none cursor-default"
                            />
                            <button
                                type="button"
                                onClick={handleBrowseISO}
                                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-colors flex items-center gap-2 text-gray-700"
                            >
                                <FolderOpen size={16} />
                                Browse
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="px-5 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {creating ? 'Creating...' : 'Create VM'}
                    </button>
                </div>
            </div>
        </div>
    );
}
