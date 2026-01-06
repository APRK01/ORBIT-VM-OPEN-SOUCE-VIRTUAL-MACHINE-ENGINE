import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { X, FolderKanban } from 'lucide-react';
import { Space } from '../types';

interface CreateSpaceModalProps {
    onClose: () => void;
    onCreated: (space: Space) => void;
}

export function CreateSpaceModal({ onClose, onCreated }: CreateSpaceModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Please enter a space name');
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const space: Space = {
                id: crypto.randomUUID(),
                name,
                icon: 'folder',
                description: description || undefined,
            };

            await invoke('create_space', { space });
            onCreated(space);
            onClose();
        } catch (e) {
            setError(String(e));
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <FolderKanban size={20} className="text-black" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Create Space</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Space Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Web Development"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., VMs for web projects"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400"
                        />
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
                        {creating ? 'Creating...' : 'Create Space'}
                    </button>
                </div>
            </div>
        </div>
    );
}
