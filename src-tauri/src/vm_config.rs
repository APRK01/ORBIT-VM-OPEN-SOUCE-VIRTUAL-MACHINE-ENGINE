use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Space {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VMConfig {
    pub id: String,
    pub name: String,
    pub space_id: String,
    pub cpu_cores: u32,
    pub ram_mb: u32,
    pub disk_path: String,
    pub iso_path: Option<String>,
    pub arch: String,
    #[serde(default)]
    pub status: VMStatus,
    pub vnc_port: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum VMStatus {
    #[default]
    Stopped,
    Running,
}

impl VMConfig {
    pub fn config_dir() -> PathBuf {
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
        home.join(".config").join("orbit-vm")
    }
    
    pub fn vms_dir() -> PathBuf {
        Self::config_dir().join("vms")
    }
    
    pub fn spaces_file() -> PathBuf {
        Self::config_dir().join("spaces.json")
    }
    
    pub fn save(&self) -> Result<(), String> {
        let dir = Self::vms_dir();
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let path = dir.join(format!("{}.json", self.id));
        let json = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(path, json).map_err(|e| e.to_string())
    }
    
    pub fn load_all() -> Vec<VMConfig> {
        let dir = Self::vms_dir();
        if !dir.exists() {
            return vec![];
        }
        fs::read_dir(dir)
            .map(|entries| {
                entries
                    .filter_map(|e| e.ok())
                    .filter(|e| e.path().extension().map(|ext| ext == "json").unwrap_or(false))
                    .filter_map(|e| fs::read_to_string(e.path()).ok())
                    .filter_map(|s| serde_json::from_str(&s).ok())
                    .collect()
            })
            .unwrap_or_default()
    }
}

impl Space {
    pub fn load_all() -> Vec<Space> {
        let path = VMConfig::spaces_file();
        if !path.exists() {
            return vec![Space {
                id: "default".to_string(),
                name: "Default".to_string(),
                icon: "folder".to_string(),
                description: Some("Your personal VMs".to_string()),
            }];
        }
        fs::read_to_string(path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    }
    
    pub fn save_all(spaces: &[Space]) -> Result<(), String> {
        let dir = VMConfig::config_dir();
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
        let path = VMConfig::spaces_file();
        let json = serde_json::to_string_pretty(spaces).map_err(|e| e.to_string())?;
        fs::write(path, json).map_err(|e| e.to_string())
    }
}
