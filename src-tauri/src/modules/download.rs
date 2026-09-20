use futures_util::StreamExt;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

#[tauri::command]
pub async fn download_build(
    app: AppHandle,
    url: String,
    dest: String,
) -> Result<(), String> {
    let dest_path = PathBuf::from(&dest);

    if let Some(parent) = dest_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Server returned status {}", response.status()));
    }

    let total = response.content_length().unwrap_or(0);

    let mut file = std::fs::File::create(&dest_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        use std::io::Write;
        file.write_all(&chunk)
            .map_err(|e| format!("Write error: {}", e))?;
        downloaded += chunk.len() as u64;

        let pct = if total > 0 {
            (downloaded as f64 / total as f64) * 100.0
        } else {
            0.0
        };

        let _ = app.emit(
            "build-download-progress",
            serde_json::json!({
                "downloaded": downloaded,
                "total": total,
                "percent": pct
            }),
        );
    }

    Ok(())
}

#[tauri::command]
pub async fn extract_build(
    app: AppHandle,
    archive: String,
    destination: String,
) -> Result<(), String> {
    let archive_path = PathBuf::from(&archive);
    let dest_path = PathBuf::from(&destination);

    std::fs::create_dir_all(&dest_path).map_err(|e| e.to_string())?;

    let extension = archive_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    let total_size = std::fs::metadata(&archive_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let mut extracted: u64 = 0;

    match extension.as_str() {
        "zip" => {
            let file = std::fs::File::open(&archive_path).map_err(|e| e.to_string())?;
            let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

            for i in 0..archive.len() {
                let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
                let outpath = dest_path.join(file.name());

                if file.name().ends_with('/') {
                    std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
                } else {
                    if let Some(parent) = outpath.parent() {
                        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
                    }
                    let mut outfile = std::fs::File::create(&outpath).map_err(|e| e.to_string())?;
                    use std::io::Write;
                    use std::io::Read;
                    let mut buffer = [0u8; 8192];
                    loop {
                        let n = file.read(&mut buffer).map_err(|e| e.to_string())?;
                        if n == 0 { break; }
                        outfile.write_all(&buffer[..n]).map_err(|e| e.to_string())?;
                        extracted += n as u64;
                    }
                }

                let pct = if total_size > 0 {
                    (extracted as f64 / total_size as f64) * 100.0
                } else {
                    0.0
                };

                let _ = app.emit(
                    "build-extract-progress",
                    serde_json::json!({
                        "extracted": extracted,
                        "total": total_size,
                        "percent": pct
                    }),
                );
            }
        }
        "rar" => {
            let archive_path_str = archive_path.to_str().ok_or("Invalid path")?;
            let dest_path_str = dest_path.to_str().ok_or("Invalid destination path")?;
            
            use std::process::Command;
            let output = Command::new("unrar")
                .args(["x", "-y", archive_path_str, dest_path_str])
                .output()
                .map_err(|e| format!("Failed to run unrar: {}. Make sure unrar is installed.", e))?;
            
            if !output.status.success() {
                return Err(format!("unrar failed: {}", String::from_utf8_lossy(&output.stderr)));
            }
            
            extracted = total_size;
            let _ = app.emit(
                "build-extract-progress",
                serde_json::json!({
                    "extracted": extracted,
                    "total": total_size,
                    "percent": 100.0
                }),
            );
        }
        _ => return Err("Unsupported archive format".to_string()),
    }

    Ok(())
}
