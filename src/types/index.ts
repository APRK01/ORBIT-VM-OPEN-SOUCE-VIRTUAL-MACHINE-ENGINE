export interface Space {
    id: string;
    name: string;
    icon: string;
    description?: string;
}

export interface VMConfig {
    id: string;
    name: string;
    spaceId: string;
    cpuCores: number;
    ramMb: number;
    diskPath: string;
    isoPath?: string;
    arch: string;
    status: 'stopped' | 'running';
    vncPort?: number;
}
