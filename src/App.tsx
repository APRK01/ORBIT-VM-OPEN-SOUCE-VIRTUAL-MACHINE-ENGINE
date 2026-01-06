import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { MainLayout } from './layouts/MainLayout';
import { Sidebar } from './components/Sidebar';
import { SpaceView } from './components/SpaceView';
import { Onboarding } from './components/Onboarding';
import { LoadingScreen } from './components/LoadingScreen';
import { OSSelection } from './components/OSSelection';
import { CreateVMWizard } from './components/CreateVMWizard';
import { CreateSpaceModal } from './components/CreateSpaceModal';
import { Settings } from './components/Settings';
import { EditVMModal } from './components/EditVMModal';
import { Space, VMConfig } from './types';
import './index.css';

const defaultSpaces: Space[] = [
  { id: 'default', name: 'Default', icon: 'folder', description: 'Your personal VMs' },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [osSelected, setOsSelected] = useState<boolean>(false);
  const [qemuInstalled, setQemuInstalled] = useState<boolean | null>(null);

  const [spaces, setSpaces] = useState<Space[]>(defaultSpaces);
  const [vms, setVMs] = useState<VMConfig[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('default');

  const [showCreateVM, setShowCreateVM] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingVM, setEditingVM] = useState<VMConfig | null>(null);

  useEffect(() => {
    const savedOs = localStorage.getItem('orbit-os-preference');
    if (savedOs) setOsSelected(true);
  }, []);

  useEffect(() => {
    invoke<boolean>('check_qemu_installed').then(setQemuInstalled);
  }, []);

  useEffect(() => {
    if (qemuInstalled && !loading && osSelected) {
      invoke<Space[]>('list_spaces').then(s => {
        if (s.length > 0) setSpaces(s);
      });
      invoke<VMConfig[]>('list_vms').then(setVMs);
    }
  }, [qemuInstalled, loading, osSelected]);

  const handleOSSelect = (os: 'macos' | 'windows') => {
    localStorage.setItem('orbit-os-preference', os);
    setOsSelected(true);
  };

  const handleStartVM = async (id: string) => {
    try {
      const vncPort = await invoke<number>('start_vm', { id });
      setVMs(prev => prev.map(vm =>
        vm.id === id ? { ...vm, status: 'running' as const, vncPort } : vm
      ));
      await invoke('open_vnc', { port: vncPort });
    } catch (error) {
      console.error('Failed to start VM:', error);
      alert(`Failed to start VM: ${error}`);
    }
  };

  const handleStopVM = async (id: string) => {
    try {
      await invoke('stop_vm', { id });
      setVMs(prev => prev.map(vm =>
        vm.id === id ? { ...vm, status: 'stopped' as const, vncPort: undefined } : vm
      ));
    } catch (error) {
      console.error('Failed to stop VM:', error);
      alert(`Failed to stop VM: ${error}`);
    }
  };

  const handleOpenConsole = async (id: string) => {
    const vm = vms.find(v => v.id === id);
    if (vm?.vncPort) {
      try {
        await invoke('open_vnc', { port: vm.vncPort });
      } catch (error) {
        console.error('Failed to open VNC:', error);
        alert(`Failed to open console: ${error}`);
      }
    }
  };

  const handleDeleteVM = async (id: string) => {
    if (!confirm('Delete this VM? This will also delete the disk file.')) return;
    try {
      await invoke('delete_vm', { id, deleteDisk: true });
      setVMs(prev => prev.filter(vm => vm.id !== id));
    } catch (error) {
      console.error('Failed to delete VM:', error);
      alert(`Failed to delete VM: ${error}`);
    }
  };

  const handleEditVM = (vm: VMConfig) => {
    setEditingVM(vm);
  };

  const handleSaveVM = async (updatedVM: VMConfig) => {
    try {
      await invoke('update_vm', { config: updatedVM });
      setVMs(prev => prev.map(vm => vm.id === updatedVM.id ? updatedVM : vm));
    } catch (error) {
      console.error('Failed to update VM:', error);
      alert(`Failed to update VM: ${error}`);
    }
  };

  const handleCloneVM = async (vm: VMConfig) => {
    const cloneName = `${vm.name} (Copy)`;
    try {
      const newVM = await invoke<VMConfig>('clone_vm', { id: vm.id, newName: cloneName });
      setVMs(prev => [...prev, newVM]);
    } catch (error) {
      console.error('Failed to clone VM:', error);
      alert(`Failed to clone VM: ${error}`);
    }
  };

  const handleVMCreated = (vm: VMConfig) => {
    setVMs(prev => [...prev, vm]);
  };

  const handleSpaceCreated = (space: Space) => {
    setSpaces(prev => [...prev, space]);
    setActiveSpaceId(space.id);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  if (!osSelected) {
    return <OSSelection onSelect={handleOSSelect} />;
  }

  if (qemuInstalled === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-gray-400 font-medium">Checking System...</div>
      </div>
    );
  }

  if (!qemuInstalled) {
    return <Onboarding onComplete={() => setQemuInstalled(true)} />;
  }

  const activeSpace = spaces.find(s => s.id === activeSpaceId) || null;
  const spaceVMs = vms.filter(vm => vm.spaceId === activeSpaceId);

  return (
    <>
      <MainLayout
        sidebar={
          <Sidebar
            spaces={spaces}
            activeSpaceId={activeSpaceId}
            onSpaceSelect={setActiveSpaceId}
            onCreateSpace={() => setShowCreateSpace(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        }
      >
        <SpaceView
          space={activeSpace}
          vms={spaceVMs}
          onStartVM={handleStartVM}
          onStopVM={handleStopVM}
          onOpenConsole={handleOpenConsole}
          onDeleteVM={handleDeleteVM}
          onEditVM={handleEditVM}
          onCloneVM={handleCloneVM}
          onCreateVM={() => setShowCreateVM(true)}
        />
      </MainLayout>

      {showCreateVM && (
        <CreateVMWizard
          spaceId={activeSpaceId}
          onClose={() => setShowCreateVM(false)}
          onCreated={handleVMCreated}
        />
      )}
      {showCreateSpace && (
        <CreateSpaceModal
          onClose={() => setShowCreateSpace(false)}
          onCreated={handleSpaceCreated}
        />
      )}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
      {editingVM && (
        <EditVMModal
          vm={editingVM}
          onClose={() => setEditingVM(null)}
          onSave={handleSaveVM}
        />
      )}
    </>
  );
}

export default App;
