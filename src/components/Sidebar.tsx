import { FolderKanban, Plus, Settings } from 'lucide-react';
import { Space } from '../types';

interface SidebarProps {
    spaces: Space[];
    activeSpaceId: string | null;
    onSpaceSelect: (id: string) => void;
    onCreateSpace: () => void;
    onOpenSettings: () => void;
}

export function Sidebar({ spaces, activeSpaceId, onSpaceSelect, onCreateSpace, onOpenSettings }: SidebarProps) {
    return (
        <aside className="w-64 h-full bg-gray-50/80 backdrop-blur-xl border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Orbit VM</h1>
                <p className="text-xs text-gray-500 mt-0.5">Virtual Machine Manager</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Spaces</span>
                    <button
                        onClick={onCreateSpace}
                        className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="New Space"
                    >
                        <Plus size={14} className="text-gray-500" />
                    </button>
                </div>

                <nav className="space-y-0.5">
                    {spaces.map((space) => (
                        <button
                            key={space.id}
                            onClick={() => onSpaceSelect(space.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 ${activeSpaceId === space.id
                                    ? 'bg-black text-white font-medium shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FolderKanban size={18} className={activeSpaceId === space.id ? 'text-white' : 'text-gray-500'} />
                            <span className="text-sm font-medium truncate">{space.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-3 border-t border-gray-200">
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <Settings size={18} />
                    <span className="text-sm">Settings</span>
                </button>
            </div>
        </aside>
    );
}
