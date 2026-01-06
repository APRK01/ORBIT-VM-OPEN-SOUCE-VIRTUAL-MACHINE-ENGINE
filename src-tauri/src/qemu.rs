use std::collections::HashMap;
use std::process::{Child, Command};
use std::sync::Mutex;
use std::net::TcpListener;

use crate::vm_config::VMConfig;

pub struct QemuManager {
    processes: Mutex<HashMap<String, Child>>,
}

impl QemuManager {
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }
    
    fn find_free_port(&self, start: u16) -> u16 {
        (start..start + 100)
            .find(|&port| TcpListener::bind(("127.0.0.1", port)).is_ok())
            .unwrap_or(start)
    }
    
    fn get_qemu_binary() -> &'static str {
        #[cfg(target_os = "macos")]
        {
            "qemu-system-aarch64"
        }
        #[cfg(target_os = "windows")]
        {
            "qemu-system-x86_64"
        }
        #[cfg(target_os = "linux")]
        {
            "qemu-system-x86_64"
        }
    }
    
    fn get_accel() -> &'static str {
        #[cfg(target_os = "macos")]
        {
            "hvf"
        }
        #[cfg(target_os = "windows")]
        {
            "whpx"
        }
        #[cfg(target_os = "linux")]
        {
            "kvm"
        }
    }
    
    pub fn start_vm(&self, config: &mut VMConfig) -> Result<u16, String> {
        let vnc_port = self.find_free_port(5900);
        let vnc_display = vnc_port - 5900;
        
        let mut cmd = Command::new(Self::get_qemu_binary());
        
        #[cfg(target_os = "macos")]
        {
            cmd.args([
                "-accel", Self::get_accel(),
                "-M", "virt,highmem=on",
                "-cpu", "host",
                "-smp", &config.cpu_cores.to_string(),
                "-m", &config.ram_mb.to_string(),
            ]);
            
            cmd.args([
                "-device", "virtio-gpu-pci",
                "-display", &format!("vnc=127.0.0.1:{}", vnc_display),
            ]);
        }
        
        #[cfg(target_os = "windows")]
        {
            cmd.args([
                "-accel", Self::get_accel(),
                "-m", &config.ram_mb.to_string(),
                "-smp", &config.cpu_cores.to_string(),
                "-display", &format!("vnc=127.0.0.1:{}", vnc_display),
            ]);
        }
        
        #[cfg(target_os = "linux")]
        {
            cmd.args([
                "-enable-kvm",
                "-m", &config.ram_mb.to_string(),
                "-smp", &config.cpu_cores.to_string(),
                "-display", &format!("vnc=127.0.0.1:{}", vnc_display),
            ]);
        }
        
        cmd.args([
            "-device", "qemu-xhci",
            "-device", "usb-kbd",
            "-device", "usb-tablet",
        ]);
        
        cmd.args([
            "-device", "virtio-net-pci,netdev=net0",
            "-netdev", "user,id=net0",
        ]);
        
        if !config.disk_path.is_empty() {
            cmd.args([
                "-drive", &format!("file={},if=none,id=hd0,format=qcow2", config.disk_path),
                "-device", "virtio-blk-pci,drive=hd0,bootindex=2",
            ]);
        }
        
        if let Some(iso) = &config.iso_path {
            if !iso.is_empty() {
                cmd.args([
                    "-drive", &format!("file={},if=none,id=cd0,media=cdrom", iso),
                    "-device", "virtio-blk-pci,drive=cd0,bootindex=1",
                ]);
            }
        }
        
        #[cfg(target_os = "macos")]
        {
            let edk2_paths = [
                "/opt/homebrew/share/qemu/edk2-aarch64-code.fd",
                "/usr/local/share/qemu/edk2-aarch64-code.fd",
            ];
            for path in edk2_paths {
                if std::path::Path::new(path).exists() {
                    cmd.args(["-bios", path]);
                    break;
                }
            }
        }
        
        let child = cmd.spawn().map_err(|e| format!("Failed to start QEMU: {}", e))?;
        
        self.processes.lock().unwrap().insert(config.id.clone(), child);
        config.vnc_port = Some(vnc_port);
        
        Ok(vnc_port)
    }
    
    pub fn stop_vm(&self, id: &str) -> Result<(), String> {
        let mut procs = self.processes.lock().unwrap();
        if let Some(mut child) = procs.remove(id) {
            child.kill().map_err(|e| e.to_string())?;
            child.wait().ok();
        }
        Ok(())
    }
    
    pub fn create_snapshot(&self, disk_path: &str, snapshot_name: &str) -> Result<(), String> {
        let output = Command::new("qemu-img")
            .args(["snapshot", "-c", snapshot_name, disk_path])
            .output()
            .map_err(|e| format!("Failed to create snapshot: {}", e))?;
        
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(())
    }
    
    pub fn restore_snapshot(&self, disk_path: &str, snapshot_name: &str) -> Result<(), String> {
        let output = Command::new("qemu-img")
            .args(["snapshot", "-a", snapshot_name, disk_path])
            .output()
            .map_err(|e| format!("Failed to restore snapshot: {}", e))?;
        
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(())
    }
    
    pub fn delete_snapshot(&self, disk_path: &str, snapshot_name: &str) -> Result<(), String> {
        let output = Command::new("qemu-img")
            .args(["snapshot", "-d", snapshot_name, disk_path])
            .output()
            .map_err(|e| format!("Failed to delete snapshot: {}", e))?;
        
        if !output.status.success() {
            return Err(String::from_utf8_lossy(&output.stderr).to_string());
        }
        Ok(())
    }
    
    pub fn list_snapshots(&self, disk_path: &str) -> Result<Vec<String>, String> {
        let output = Command::new("qemu-img")
            .args(["snapshot", "-l", disk_path])
            .output()
            .map_err(|e| format!("Failed to list snapshots: {}", e))?;
        
        if !output.status.success() {
            return Ok(vec![]);
        }
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        let snapshots: Vec<String> = stdout
            .lines()
            .skip(2)
            .filter_map(|line| {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    Some(parts[1].to_string())
                } else {
                    None
                }
            })
            .collect();
        
        Ok(snapshots)
    }
}

impl Default for QemuManager {
    fn default() -> Self {
        Self::new()
    }
}
