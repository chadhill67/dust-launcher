// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::fs;
use std::path::{Path, PathBuf};
use sysinfo::{ProcessExt, System, SystemExt};

mod modules;
mod utilities;

#[tauri::command]
fn locate_version(file_path: String) -> Result<Vec<String>, String> {
    let file_contents = fs::read(&file_path)
        .map_err(|error| format!("Failed to read file '{}': {}", file_path, error))?;

    const VERSION_SIGNATURE: &[u8] = &[
        0x2b, 0x00, 0x2b, 0x00, 0x46, 0x00, 0x6f, 0x00, 0x72, 0x00, 0x74, 0x00, 0x6e, 0x00, 0x69,
        0x00, 0x74, 0x00, 0x65, 0x00, 0x2b, 0x00,
    ];

    let mut version_strings = Vec::new();
    let signature_len = VERSION_SIGNATURE.len();

    for match_pos in find_pattern_positions(&file_contents, VERSION_SIGNATURE) {
        if let Some(version_text) = extract_version_string(&file_contents, match_pos, signature_len)
        {
            version_strings.push(version_text);
        }
    }

    Ok(version_strings)
}

fn find_pattern_positions(haystack: &[u8], needle: &[u8]) -> Vec<usize> {
    haystack
        .windows(needle.len())
        .enumerate()
        .filter_map(
            |(idx, window)| {
                if window == needle {
                    Some(idx)
                } else {
                    None
                }
            },
        )
        .collect()
}

fn extract_version_string(
    buffer: &[u8],
    pattern_start: usize,
    pattern_len: usize,
) -> Option<String> {
    const SEARCH_RANGE: usize = 64;

    let text_start = pattern_start;
    let search_end = (pattern_start + pattern_len + SEARCH_RANGE).min(buffer.len());

    let string_end = locate_string_terminator(&buffer[pattern_start + pattern_len..search_end])?;
    let total_length = pattern_len + string_end;

    if total_length % 2 != 0 {
        return None;
    }

    let utf16_data: Vec<u16> = buffer[text_start..text_start + total_length]
        .chunks_exact(2)
        .map(|chunk| u16::from_le_bytes([chunk[0], chunk[1]]))
        .collect();

    let decoded_string = String::from_utf16_lossy(&utf16_data);
    Some(decoded_string.trim_matches('\0').trim().to_string())
}

fn locate_string_terminator(data: &[u8]) -> Option<usize> {
    data.chunks_exact(2)
        .position(|chunk| chunk == [0x00, 0x00])
        .map(|pos| pos * 2)
        .or_else(|| Some(data.len().min(64)))
}

#[tauri::command]
fn get_directory_size(path: String) -> Result<u64, String> {
    let dir = Path::new(&path);
    if !dir.exists() || !dir.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    fn calculate_size(dir: &Path) -> std::io::Result<u64> {
        let mut total = 0;
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                total += calculate_size(&path)?;
            } else {
                total += entry.metadata()?.len();
            }
        }
        Ok(total)
    }

    calculate_size(dir).map_err(|e| e.to_string())
}

#[tauri::command]
fn check_file_exists(path: String) -> bool {
    let p = Path::new(&path);
    p.exists()
}

#[tauri::command]
fn file_exists(path: String) -> bool {
    let p = Path::new(&path);
    p.exists()
}

#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.exists() {
        fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn is_fn_running() -> bool {
    let sys = System::new_all();

    for process in sys.processes().values() {
        let name = process.name().to_lowercase();
        if name == "fortniteclient-win64-shipping.exe" {
            return true;
        }
    }

    false
}

#[tauri::command]
fn find_shipping_exe(root: String) -> Option<String> {
    const EXE: &str = "FortniteClient-Win64-Shipping.exe";

    fn check_dir(dir: &Path) -> Option<PathBuf> {
        let candidates = [
            dir.join("FortniteGame").join("Binaries").join("Win64").join(EXE),
            dir.join("Binaries").join("Win64").join(EXE),
            dir.join(EXE),
        ];

        for candidate in candidates.iter() {
            if candidate.is_file() {
                return Some(candidate.clone());
            }
        }

        None
    }

    fn search(dir: &Path, depth: u32, out: &mut Option<PathBuf>) {
        if out.is_some() || depth > 4 {
            return;
        }

        let Ok(entries) = std::fs::read_dir(dir) else {
            return;
        };

        for entry in entries.flatten() {
            if out.is_some() {
                return;
            }

            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            if let Some(found) = check_dir(&path) {
                *out = Some(found);
                return;
            }

            search(&path, depth + 1, out);
        }
    }

    let root_buf = PathBuf::from(&root);

    let mut current = Some(root_buf.as_path());
    while let Some(dir) = current {
        if let Some(found) = check_dir(dir) {
            return Some(found.to_string_lossy().into_owned());
        }
        current = dir.parent();
    }

    let mut found = None;
    search(&root_buf, 0, &mut found);
    found.map(|p| p.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            check_file_exists,
            file_exists,
            locate_version,
            get_directory_size,
            delete_file,
            is_fn_running,
            find_shipping_exe,
            modules::exclude::add_defender_exclusion,
            modules::exclude::exclude_launcher,
            modules::game::launch_game,
            modules::game::close_game,
            modules::game::download_paks,
            modules::settings::set_always_on_top,
            modules::download::download_build,
            modules::download::extract_build,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
