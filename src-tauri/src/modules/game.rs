use std::ffi::{CString, OsStr, OsString};
use std::fs;
use std::mem::zeroed;
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use winapi::shared::windef::HWND;
use winapi::um::processthreadsapi::GetProcessId;
use winapi::um::shellapi::{ShellExecuteExA, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOA};
use winapi::um::{handleapi::CloseHandle, winbase::CREATE_SUSPENDED, winuser::SW_SHOW};

use tauri::Emitter;
use tauri::Window;

use crate::utilities;

use serde::Deserialize;

const CREATE_NO_WINDOW: u32 = 0x08000000;

fn get_remote_file_size(url: &str) -> Result<u64, String> {
    let client = reqwest::blocking::Client::new();
    let response = client
        .head(url)
        .send()
        .map_err(|e| format!("Failed to get file info: {}", e))?;

    response
        .headers()
        .get(reqwest::header::CONTENT_LENGTH)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.parse::<u64>().ok())
        .ok_or_else(|| "Could not determine remote file size".to_string())
}

fn should_skip_download(local_path: &Path, remote_url: &str) -> Result<bool, String> {
    if !local_path.exists() {
        return Ok(false);
    }

    let local_size = fs::metadata(local_path)
        .map_err(|e| format!("Failed to get local file size: {}", e))?
        .len();

    match get_remote_file_size(remote_url) {
        Ok(remote_size) => Ok(local_size == remote_size),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub fn launch_game(
    window: Window,
    file_path: String,
    email: String,
    password: String,
    redirect_link: String,
    backend: String,
    inject_extra_dlls: bool,
    extra_dll_links: Vec<String>,
    use_custom_paks: bool,
    custom_paks_links: Vec<String>,
    extra_dll_options: Vec<std::collections::HashMap<String, String>>,
    high_priority: Option<bool>,
    admin_launch: Option<bool>,
) -> Result<bool, String> {
    let _ = utilities::kill_all_procs();

    let game_path = PathBuf::from(&file_path);
    let game_game_directory: &Path = game_path
        .parent()
        .expect("Failed to get parent directory")
        .parent()
        .expect("Failed to get FortniteGame directory");

    let game_dll_path = utilities::handle_game_dll_path(game_game_directory);

    if game_dll_path.exists() {
        if let Err(err) = utilities::remove_game_dll_sync(game_game_directory) {
            return Err(format!("Failed to remove game DLL: {}", err));
        }
    }

    let dll_url = &format!("{}", redirect_link);

    match should_skip_download(&game_dll_path, dll_url) {
        Ok(true) => {
            let _ = window.emit(
                "download-progress",
                serde_json::json!({
                    "type": "main_dll",
                    "file": game_dll_path.file_name().unwrap_or_default().to_string_lossy(),
                    "progress": 100,
                    "stage": "skipped"
                }),
            );
        }
        _ => {
            if let Err(err) = utilities::download_file(dll_url, &game_dll_path) {
                return Err(format!("Failed to download game DLL: {}", err));
            }
        }
    }

    let cwd = game_game_directory.join("Win64");

    let fn_launcher = cwd.join("FortniteLauncher.exe");
    let fn_shipping = cwd.join("FortniteClient-Win64-Shipping.exe");
    let eac = cwd.join("FortniteClient-Win64-Shipping_BE.exe");

    if !game_dll_path.exists() {
        return Err("Failed to find Redirect".to_string());
    }

    let mut combined_args = vec![
        "-epicapp=Fortnite",
        "-epicenv=Prod",
        "-epiclocale=en-us",
        "-epicportal",
        "-nobe",
        "-fromfl=eac",
        "-nocodeguards",
        "-nouac",
        "-fltoken=3db3ba5dcbd2e16703f3978d",
        "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQs",
        "-skippatchcheck",
        "-AUTH_TYPE=epic",
        "-useallavailablecores",
        "-steamimportavailable",
    ]
    .into_iter()
    .map(|s| s.to_string())
    .collect::<Vec<String>>();

    combined_args.insert(combined_args.len() - 3, format!("-AUTH_LOGIN={}", email));
    combined_args.insert(
        combined_args.len() - 3,
        format!("-AUTH_PASSWORD={}", password),
    );

    combined_args.push(format!("-backend={}", backend));

    let paks_dir = game_game_directory.join("Content").join("Paks");

    std::fs::create_dir_all(&paks_dir).map_err(|e| format!("Failed to create Paks dir: {}", e))?;

    if use_custom_paks && !custom_paks_links.is_empty() {
        for (idx, link) in custom_paks_links.iter().enumerate() {
            let link = link.trim();
            if link.is_empty() {
                continue;
            }

            let clean_url = link.split('?').next().unwrap_or(link);

            let filename = match clean_url.rsplit('/').next() {
                Some(name) if !name.is_empty() => name.to_string(),
                _ => format!("CustomPak_{}.pak", idx),
            };

            let save_path = paks_dir.join(&filename);

            match should_skip_download(&save_path, link) {
                Ok(true) => {
                    let _ = window.emit(
                        "download-progress",
                        serde_json::json!({
                            "type": "pak",
                            "file": filename,
                            "progress": 100,
                            "stage": "skipped"
                        }),
                    );
                }
                _ => {
                    let _ = window.emit(
                        "download-progress",
                        serde_json::json!({
                            "type": "pak",
                            "file": filename,
                            "progress": 0
                        }),
                    );

                    if let Err(err) = utilities::download_file(link, &save_path) {
                        eprintln!("Failed to download custom pak '{}': {}", link, err);
                        continue;
                    }

                    let _ = window.emit(
                        "download-progress",
                        serde_json::json!({
                            "type": "pak",
                            "file": filename,
                            "progress": 100
                        }),
                    );
                }
            }
        }
    }

    let combined_args_os: Vec<OsString> = combined_args
        .iter()
        .map(|arg| OsString::from(arg))
        .collect();

    let combined_args_str: String = combined_args_os
        .iter()
        .map(|s| s.to_string_lossy())
        .collect::<Vec<_>>()
        .join(" ");

    let hwnd: HWND = std::ptr::null_mut();

    let exe_str = fn_shipping.to_str().ok_or("Invalid path to executable")?;
    let exe_cstring = CString::new(exe_str).map_err(|e| format!("CString error: {}", e))?;

    let args_cstring =
        CString::new(combined_args_str).map_err(|e| format!("CString error: {}", e))?;

    let lp_file = exe_cstring;
    let lp_params = args_cstring;
    let lp_verb = if admin_launch.unwrap_or(false) {
        CString::new("runas").unwrap()
    } else {
        CString::new("open").unwrap()
    };

    let mut sei: SHELLEXECUTEINFOA = unsafe { zeroed() };
    sei.cbSize = std::mem::size_of::<SHELLEXECUTEINFOA>() as u32;
    sei.fMask = SEE_MASK_NOCLOSEPROCESS;
    sei.hwnd = hwnd;
    sei.lpVerb = lp_verb.as_ptr();
    sei.lpFile = lp_file.as_ptr();
    sei.lpParameters = lp_params.as_ptr();
    sei.nShow = SW_SHOW;

    let success = unsafe { ShellExecuteExA(&mut sei) };
    if success == 0 {
        return Err("ShellExecuteExA failed".to_string());
    }

    let pid = if !sei.hProcess.is_null() {
        let p = unsafe { GetProcessId(sei.hProcess) };
        if high_priority.unwrap_or(true) {
            use winapi::um::processthreadsapi::SetPriorityClass;
            use winapi::um::winbase::HIGH_PRIORITY_CLASS;
            unsafe {
                SetPriorityClass(sei.hProcess, HIGH_PRIORITY_CLASS);
            }
        }
        unsafe { CloseHandle(sei.hProcess) };
        p
    } else {
        0
    };

    std::thread::sleep(std::time::Duration::from_secs(5));

    let _eac_proc = Command::new(&eac)
        .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
        .args(
            combined_args_os
                .iter()
                .map(|arg| arg as &OsStr)
                .collect::<Vec<&OsStr>>(),
        )
        .stdout(Stdio::piped())
        .spawn();

    let _launcher_proc = Command::new(&fn_launcher)
        .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
        .args(
            combined_args_os
                .iter()
                .map(|arg| arg as &OsStr)
                .collect::<Vec<&OsStr>>(),
        )
        .stdout(Stdio::piped())
        .spawn();

    std::thread::sleep(std::time::Duration::from_secs(5));

    if inject_extra_dlls && pid != 0 {
        for (idx, link) in extra_dll_links.iter().enumerate() {
            if link.trim().is_empty() || link.contains("put extra dlls in here") {
                continue;
            }

            let clean_link = link.split('?').next().unwrap_or(link);

            let filename = match clean_link.rsplit('/').next() {
                Some(name) if !name.is_empty() => name.replace('%', "_"),
                _ => format!("ExtraDll_{}.dll", idx),
            };

            let save_path = game_game_directory.join("Win64").join(&filename);

            match should_skip_download(&save_path, link) {
                Ok(true) => {
                    let _ = window.emit(
                        "download-progress",
                        serde_json::json!({
                            "type": "dll",
                            "file": filename,
                            "progress": 100,
                            "stage": "skipped"
                        }),
                    );
                }
                _ => {
                    let _ = window.emit(
                        "download-progress",
                        serde_json::json!({
                            "type": "dll",
                            "file": filename,
                            "progress": 0
                        }),
                    );

                    if let Err(err) = utilities::download_file(link, &save_path) {
                        eprintln!("Failed to download extra DLL '{}': {}", link, err);
                        continue;
                    }

                    let _ = window.emit(
                        "download-progress",
                        serde_json::json!({
                            "type": "dll",
                            "file": filename,
                            "progress": 100
                        }),
                    );
                }
            }

            if let Some(dll_path_str) = save_path.to_str() {
                if let Err(e) = utilities::inject_dll(pid, dll_path_str) {
                    eprintln!("Failed to inject extra DLL '{}': {}", save_path.display(), e);
                }
            }

            std::thread::sleep(std::time::Duration::from_millis(300));
        }

        for option in extra_dll_options.iter() {
            for (_key, link) in option.iter() {
                if link.trim().is_empty() || link.contains("put extra dlls in here") {
                    continue;
                }

                let clean_link = link.split('?').next().unwrap_or(link);

                let filename = match clean_link.rsplit('/').next() {
                    Some(name) if !name.is_empty() => name.replace('%', "_"),
                    _ => "OptionDll.dll".to_string(),
                };

                let save_path = game_game_directory.join("Win64").join(&filename);

                match should_skip_download(&save_path, link) {
                    Ok(true) => {
                        let _ = window.emit(
                            "download-progress",
                            serde_json::json!({
                                "type": "dll",
                                "file": filename,
                                "progress": 100,
                                "stage": "skipped"
                            }),
                        );
                    }
                    _ => {
                        let _ = window.emit(
                            "download-progress",
                            serde_json::json!({
                                "type": "dll",
                                "file": filename,
                                "progress": 0
                            }),
                        );

                        if let Err(err) = utilities::download_file(link, &save_path) {
                            eprintln!("Failed to download option DLL '{}': {}", link, err);
                            continue;
                        }

                        let _ = window.emit(
                            "download-progress",
                            serde_json::json!({
                                "type": "dll",
                                "file": filename,
                                "progress": 100
                            }),
                        );
                    }
                }

                if let Some(dll_path_str) = save_path.to_str() {
                    if let Err(e) = utilities::inject_dll(pid, dll_path_str) {
                        eprintln!("Failed to inject option DLL '{}': {}", save_path.display(), e);
                    }
                }

                std::thread::sleep(std::time::Duration::from_millis(300));
            }
        }
    }

    Ok(true)
}

#[tauri::command]
pub fn close_game() -> Result<(), String> {
    let _ = utilities::kill_all_procs();
    Ok(())
}

#[tauri::command]
pub async fn download_paks(paks_dir: String, pak_links: Vec<String>) -> Result<(), String> {
    let paks_path = PathBuf::from(&paks_dir);
    std::fs::create_dir_all(&paks_path).map_err(|e| format!("Failed to create Paks dir: {}", e))?;

    for (idx, link) in pak_links.iter().enumerate() {
        let link = link.trim();
        if link.is_empty() {
            continue;
        }

        let clean_url = link.split('?').next().unwrap_or(link);

        let filename = match clean_url.rsplit('/').next() {
            Some(name) if !name.is_empty() => name.to_string(),
            _ => format!("CustomPak_{}.pak", idx),
        };

        let save_path = paks_path.join(&filename);

        match should_skip_download(&save_path, link) {
            Ok(true) => {
                continue;
            }
            _ => {
                if let Err(err) = utilities::download_file(link, &save_path) {
                    return Err(format!("Failed to download pak '{}': {}", link, err));
                }
            }
        }
    }

    Ok(())
}
