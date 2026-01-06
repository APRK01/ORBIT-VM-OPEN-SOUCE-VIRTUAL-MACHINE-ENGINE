import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, Cpu, MemoryStick, HardDrive, Disc, Camera, RotateCcw, Trash2, Plus, Loader2 } from 'lucide-react';
import { VMConfig } from '../types';

interface EditVMModalProps {
    vm: VMConfig;
    onClose: () => void;
    onSave: (vm: VMConfig) => void;
}

export function EditVMModal({ vm, onClose, onSave }: EditVMModalProps) {
    const [activeTab, setActiveTab] = useState<'general' | 'snapshots'>('general');

    const [name, setName] = useState(vm.name);
    const [cpuCores, setCpuCores] = useState(vm.cpuCores);
    const [ramMb, setRamMb] = useState(vm.ramMb);

    const [snapshots, setSnapshots] = useState<string[]>([]);
    const [loadingSnapshots, setLoadingSnapshots] = useState(false);
    const [newSnapshotName, setNewSnapshotName] = useState('');
    const [creatingSnapshot, setCreatingSnapshot] = useState(false);

    useEffect(() => {
        if (activeTab === 'snapshots') {
            loadSnapshots();
        }
    }, [activeTab]);

    const loadSnapshots = async () => {
        setLoadingSnapshots(true);
        try {
            const list = await invoke<string[]>('list_snapshots', { id: vm.id });
            setSnapshots(list);
        } catch (error) {
            console.error('Failed to list snapshots:', error);
        } finally {
            setLoadingSnapshots(false);
        }
    };

    const handleCreateSnapshot = async () => {
        if (!newSnapshotName.trim()) return;
        setCreatingSnapshot(true);
        try {
            await invoke('create_snapshot', { id: vm.id, name: newSnapshotName });
            setNewSnapshotName('');
            loadSnapshots();
        } catch (error) {
            console.error('Failed to create snapshot:', error);
            alert(`Failed to create snapshot: ${error}`);
        } finally {
            setCreatingSnapshot(false);
        }
    };

    const handleRestoreSnapshot = async (snapshotName: string) => {
        if (!confirm(`Restore snapshot "${snapshotName}"? Current state will be lost.`)) return;
        try {
            await invoke('restore_snapshot', { id: vm.id, name: snapshotName });
            alert('Snapshot restored successfully.');
        } catch (error) {
            console.error('Failed to restore snapshot:', error);
            alert(`Failed to restore snapshot: ${error}`);
        }
    };

    const handleDeleteSnapshot = async (snapshotName: string) => {
        if (!confirm(`Delete snapshot "${snapshotName}"?`)) return;
        try {
            await invoke('delete_snapshot', { id: vm.id, name: snapshotName });
            loadSnapshots();
        } catch (error) {
            console.error('Failed to delete snapshot:', error);
            alert(`Failed to delete snapshot: ${error}`);
        }
    };

    const handleSave = () => {
        onSave({
            ...vm,
            name,
            cpuCores,
            ramMb,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Edit VM</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex px-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('snapshots')}
                        className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'snapshots'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Snapshots
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'general' ? (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">VM Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
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

                            <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <HardDrive size={14} />
                                    <span className="truncate">{vm.diskPath}</span>
                                </div>
                                {vm.isoPath && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Disc size={14} />
                                        <span className="truncate">{vm.isoPath}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSnapshotName}
                                    onChange={(e) => setNewSnapshotName(e.target.value)}
                                    placeholder="Snapshot name..."
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                                />
                                <button
                                    onClick={handleCreateSnapshot}
                                    disabled={creatingSnapshot || !newSnapshotName.trim()}
                                    className="px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[40px]"
                                >
                                    {creatingSnapshot ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {loadingSnapshots ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="animate-spin text-gray-400" />
                                    </div>
                                ) : snapshots.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl">
                                        <Camera className="mx-auto text-gray-300 mb-2" size={24} />
                                        <p className="text-sm text-gray-500">No snapshots yet</p>
                                    </div>
                                ) : (
                                    snapshots.map(snap => (
                                        <div key={snap} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl group hover:border-black transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Camera size={16} className="text-gray-500 group-hover:text-black" />
                                                <span className="text-sm font-medium text-gray-700">{snap}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleRestoreSnapshot(snap)}
                                                    title="Restore Snapshot"
                                                    className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSnapshot(snap)}
                                                    title="Delete Snapshot"
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                        {activeTab === 'general' ? 'Cancel' : 'Close'}
                    </button>
                    {activeTab === 'general' && (
                        <button onClick={handleSave} className="px-5 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
