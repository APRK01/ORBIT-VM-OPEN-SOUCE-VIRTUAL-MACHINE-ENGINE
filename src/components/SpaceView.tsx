import { Plus } from 'lucide-react';
import { VMCard } from './VMCard';
import { Space, VMConfig } from '../types';

interface SpaceViewProps {
    space: Space | null;
    vms: VMConfig[];
    onStartVM: (id: string) => void;
    onStopVM: (id: string) => void;
    onOpenConsole: (id: string) => void;
    onDeleteVM: (id: string) => void;
    onEditVM: (vm: VMConfig) => void;
    onCloneVM: (vm: VMConfig) => void;
    onCreateVM: () => void;
}

export function SpaceView({ space, vms, onStartVM, onStopVM, onOpenConsole, onDeleteVM, onEditVM, onCloneVM, onCreateVM }: SpaceViewProps) {
    if (!space) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">Select a Space to view VMs</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-100 overflow-y-auto">
            <header className="sticky top-0 bg-gray-100/90 backdrop-blur-md z-10 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">{space.name}</h2>
                        {space.description && (
                            <p className="text-sm text-gray-600 mt-1">{space.description}</p>
                        )}
                    </div>
                    <button
                        onClick={onCreateVM}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus size={16} />
                        New VM
                    </button>
                </div>
            </header>

            <main className="p-8">
                {vms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
                            <Plus size={24} className="text-gray-500" />
                        </div>
                        <p className="text-gray-600">No virtual machines in this space</p>
                        <button
                            onClick={onCreateVM}
                            className="mt-4 text-black hover:underline text-sm font-medium"
                        >
                            Create your first VM
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {vms.map((vm) => (
                            <VMCard
                                key={vm.id}
                                vm={vm}
                                onStart={onStartVM}
                                onStop={onStopVM}
                                onOpenConsole={onOpenConsole}
                                onDelete={onDeleteVM}
                                onEdit={onEditVM}
                                onClone={onCloneVM}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
