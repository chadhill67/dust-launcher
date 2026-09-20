use widestring::U16CString;
use winapi::shared::ntdef::NULL;
use winapi::um::shellapi::ShellExecuteW;
use winapi::um::winnt::LPCWSTR;
use winapi::um::winuser::SW_SHOWNORMAL;

#[tauri::command]
pub fn add_defender_exclusion(path: String) -> Result<bool, String> {
    let escaped_path = path.replace('\'', "''");
    let command = format!(
        "-NoProfile -ExecutionPolicy Bypass -Command \"Add-MpPreference -ExclusionPath '{}'\"",
        escaped_path
    );

    let verb = U16CString::from_str("runas").map_err(|error| error.to_string())?;
    let file = U16CString::from_str("powershell.exe").map_err(|error| error.to_string())?;
    let params = U16CString::from_str(&command).map_err(|error| error.to_string())?;

    let result = unsafe {
        ShellExecuteW(
            NULL as _,
            verb.as_ptr() as LPCWSTR,
            file.as_ptr(),
            params.as_ptr(),
            std::ptr::null(),
            SW_SHOWNORMAL,
        )
    };

    let code = result as isize;
    if code <= 32 {
        return Err(format!("Failed to request Defender exclusion. ShellExecuteW returned {}", code));
    }

    Ok(true)
}

#[tauri::command]
pub fn exclude_launcher() -> Result<bool, String> {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            return add_defender_exclusion(parent.to_string_lossy().to_string());
        }
    }
    if let Ok(current_dir) = std::env::current_dir() {
        return add_defender_exclusion(current_dir.to_string_lossy().to_string());
    }
    Err("Could not determine launcher directory".to_string())
}
