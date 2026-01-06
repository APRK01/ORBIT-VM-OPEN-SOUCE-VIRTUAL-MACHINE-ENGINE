import { Play, Square, Monitor, Cpu, MemoryStick, Trash2, Eye, Pencil, Copy } from 'lucide-react';
import { VMConfig } from '../types';

interface VMCardProps {
    vm: VMConfig;
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onOpenConsole: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (vm: VMConfig) => void;
    onClone: (vm: VMConfig) => void;
}

export function VMCard({ vm, onStart, onStop, onOpenConsole, onDelete, onEdit, onClone }: VMCardProps) {
    const isRunning = vm.status === 'running';

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors border ${isRunning
                            ? 'bg-black border-black text-white'
                            : 'bg-white border-gray-200 text-gray-500'
                        }`}>
                        <Monitor size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{vm.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full border ${isRunning ? 'bg-black border-black' : 'bg-transparent border-gray-400'
                                }`} />
                            <span className="text-xs text-gray-600">{isRunning ? 'Running' : 'Stopped'}</span>
                        </div>
                    </div>
                </div>
                {!isRunning && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(vm)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit VM"
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            onClick={() => onClone(vm)}
                            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Clone VM"
                        >
                            <Copy size={15} />
                        </button>
                        <button
                            onClick={() => onDelete(vm.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete VM"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex gap-4 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                    <Cpu size={14} />
                    <span>{vm.cpuCores} Cores</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MemoryStick size={14} />
                    <span>{vm.ramMb} MB</span>
                </div>
            </div>

            <div className="flex gap-2">
                {isRunning ? (
                    <>
                        <button
                            onClick={() => onStop(vm.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Square size={14} />
                            Stop
                        </button>
                        <button
                            onClick={() => onOpenConsole(vm.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            <Eye size={14} />
                            View
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onStart(vm.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        <Play size={14} />
                        Start
                    </button>
                )}
            </div>
        </div>
    );
}
