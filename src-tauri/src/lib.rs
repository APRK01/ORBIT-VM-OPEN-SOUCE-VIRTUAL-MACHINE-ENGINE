mod vm_config;
mod qemu;

use std::process::Command;
use tauri::State;
use vm_config::{Space, VMConfig, VMStatus};
use qemu::QemuManager;

#[tauri::command]
fn check_qemu_installed() -> bool {
    #[cfg(target_os = "windows")]
    {
        Command::new("where")
            .arg("qemu-system-x86_64")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
    #[cfg(not(target_os = "windows"))]
    {
        // Try checking aarch64 first (Apple Silicon), then x86_64
        let aarch64 = Command::new("which")
            .arg("qemu-system-aarch64")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false);
            
        if aarch64 { return true; }
        
        Command::new("which")
            .arg("qemu-system-x86_64")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    }
}

#[tauri::command]
async fn install_qemu() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("brew")
            .args(["install", "qemu"])
            .output()
            .map_err(|e| format!("Failed to run brew: {}", e))?;
        
        if output.status.success() {
            Ok("QEMU installed successfully!".to_string())
        } else {
            Err(String::from_utf8_lossy(&output.stderr).to_string())
        }
    }
    #[cfg(target_os = "windows")]
    {
        // Try winget
        let output = Command::new("winget")
            .args(["install", "-e", "--id", "SoftwareFreedomConservancy.QEMU"])
            .output()
            .map_err(|e| format!("Failed to run winget: {}", e))?;

         if output.status.success() {
            Ok("QEMU installed successfully!".to_string())
        } else {
            Err("Automatic installation on Windows failed. Please install QEMU manually from qemu.org".to_string())
        }
    }
    #[cfg(target_os = "linux")]
    {
        Err("Please install qemu manually via your package manager (apt, pacman, etc)".to_string())
    }
}

#[tauri::command]
fn create_disk_image(path: String, size_gb: u32) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    let size = format!("{}G", size_gb);
    let output = Command::new("qemu-img")
        .args(["create", "-f", "qcow2", &path, &size])
        .output()
        .map_err(|e| format!("Failed to create disk: {}", e))?;
    
    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn get_home_dir() -> String {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| "/Users/user".to_string())
}

#[tauri::command]
fn list_spaces() -> Vec<Space> {
    Space::load_all()
}

#[tauri::command]
fn list_vms() -> Vec<VMConfig> {
    VMConfig::load_all()
}

#[tauri::command]
fn list_vms_by_space(space_id: String) -> Vec<VMConfig> {
    VMConfig::load_all()
        .into_iter()
        .filter(|vm| vm.space_id == space_id)
        .collect()
}

#[tauri::command]
fn create_vm(config: VMConfig) -> Result<VMConfig, String> {
    config.save()?;
    Ok(config)
}

#[tauri::command]
fn create_space(space: Space) -> Result<(), String> {
    let mut spaces = Space::load_all();
    spaces.push(space);
    Space::save_all(&spaces)
}

#[tauri::command]
fn delete_vm(id: String, delete_disk: bool) -> Result<(), String> {
    let vms = VMConfig::load_all();
    if let Some(vm) = vms.iter().find(|v| v.id == id) {
        if delete_disk && !vm.disk_path.is_empty() {
            let _ = std::fs::remove_file(&vm.disk_path);
        }
        let config_path = VMConfig::vms_dir().join(format!("{}.json", id));
        std::fs::remove_file(config_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn update_vm(config: VMConfig) -> Result<(), String> {
    config.save()
}

#[tauri::command]
fn clone_vm(id: String, new_name: String) -> Result<VMConfig, String> {
    let vms = VMConfig::load_all();
    let source = vms.iter().find(|v| v.id == id).ok_or("VM not found")?;
    
    let new_id = format!("{:x}", std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis());
    let new_disk_name = new_name.to_lowercase().replace(' ', "-");
    let new_disk_path = VMConfig::config_dir().join("disks").join(format!("{}.qcow2", new_disk_name));
    
    if !source.disk_path.is_empty() && std::path::Path::new(&source.disk_path).exists() {
        std::fs::copy(&source.disk_path, &new_disk_path).map_err(|e| e.to_string())?;
    }
    
    let new_vm = VMConfig {
        id: new_id,
        name: new_name,
        space_id: source.space_id.clone(),
        cpu_cores: source.cpu_cores,
        ram_mb: source.ram_mb,
        disk_path: new_disk_path.to_string_lossy().to_string(),
        iso_path: source.iso_path.clone(),
        arch: source.arch.clone(),
        status: VMStatus::Stopped,
        vnc_port: None,
    };
    
    new_vm.save()?;
    Ok(new_vm)
}

#[tauri::command]
fn start_vm(id: String, qemu: State<QemuManager>) -> Result<u16, String> {
    let mut vms = VMConfig::load_all();
    let vm = vms.iter_mut().find(|v| v.id == id).ok_or("VM not found")?;
    let port = qemu.start_vm(vm)?;
    vm.status = VMStatus::Running;
    vm.save()?;
    Ok(port)
}

#[tauri::command]
fn stop_vm(id: String, qemu: State<QemuManager>) -> Result<(), String> {
    qemu.stop_vm(&id)?;
    let mut vms = VMConfig::load_all();
    if let Some(vm) = vms.iter_mut().find(|v| v.id == id) {
        vm.status = VMStatus::Stopped;
        vm.vnc_port = None;
        vm.save()?;
    }
    Ok(())
}

    
#[tauri::command]
fn create_snapshot(id: String, name: String, qemu: State<QemuManager>) -> Result<(), String> {
    let vms = VMConfig::load_all();
    let vm = vms.iter().find(|v| v.id == id).ok_or("VM not found")?;
    qemu.create_snapshot(&vm.disk_path, &name)
}

#[tauri::command]
fn restore_snapshot(id: String, name: String, qemu: State<QemuManager>) -> Result<(), String> {
    let vms = VMConfig::load_all();
    let vm = vms.iter().find(|v| v.id == id).ok_or("VM not found")?;
    qemu.restore_snapshot(&vm.disk_path, &name)
}

#[tauri::command]
fn delete_snapshot(id: String, name: String, qemu: State<QemuManager>) -> Result<(), String> {
    let vms = VMConfig::load_all();
    let vm = vms.iter().find(|v| v.id == id).ok_or("VM not found")?;
    qemu.delete_snapshot(&vm.disk_path, &name)
}

#[tauri::command]
fn list_snapshots(id: String, qemu: State<QemuManager>) -> Result<Vec<String>, String> {
    let vms = VMConfig::load_all();
    let vm = vms.iter().find(|v| v.id == id).ok_or("VM not found")?;
    qemu.list_snapshots(&vm.disk_path)
}

#[tauri::command]
fn open_vnc(port: u16) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let tigervnc_result = Command::new("/Applications/TigerVNC Viewer 1.15.0.app/Contents/MacOS/TigerVNC Viewer")
            .arg(format!("localhost:{}", port))
            .spawn();
        
        if tigervnc_result.is_ok() {
            return Ok(());
        }
        
        Command::new("open")
            .arg(format!("vnc://localhost:{}", port))
            .spawn()
            .map_err(|e| format!("Failed to open VNC: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", &format!("vnc://localhost:{}", port)])
            .spawn()
            .map_err(|e| format!("Failed to open VNC: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(format!("vnc://localhost:{}", port))
            .spawn()
            .map_err(|e| format!("Failed to open VNC: {}", e))?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(QemuManager::new())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            check_qemu_installed,
            install_qemu,
            create_disk_image,
            get_home_dir,
            list_spaces,
            list_vms,
            list_vms_by_space,
            create_vm,
            create_space,
            delete_vm,
            update_vm,
            clone_vm,
            start_vm,
            stop_vm,
            open_vnc,
            create_snapshot,
            restore_snapshot,
            delete_snapshot,
            list_snapshots,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
