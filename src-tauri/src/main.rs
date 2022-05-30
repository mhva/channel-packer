#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use anyhow;
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashMap;
use std::ops::{Deref,DerefMut};
use std::result::Result;
use std::sync::{Arc,RwLock};
use tauri::State;
mod imageops;

#[derive(Default)]
struct AppState {
    loaded_thumbnails: Arc<RwLock<HashMap<String, CommandResult<ImageDescriptor>>>>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
enum CommandResult<T> {
    Success(T),
    Error(CommandError),
}

#[derive(Serialize, Clone)]
struct CommandError {
    code: String,
    message: String,
}

#[derive(Serialize, Debug, Clone)]
pub struct ImageDescriptor {
    thumbnail: String,
    metadata: imageops::ImageMetadata,
}

impl<T: Serialize> From<Result<T, anyhow::Error>> for CommandResult<T> {
    fn from(a: Result<T, anyhow::Error>) -> CommandResult<T> {
        match a {
            Ok(data) => CommandResult::Success(data),
            Err(err) => CommandResult::Error(CommandError {
                code: "error".to_string(),
                message: err.to_string(),
            }),
        }
    }
}

#[tauri::command]
fn create_image_descriptor(
    path: &str,
    thumbnail_width: u32,
    thumbnail_height: u32,
    state: State<'_, AppState>
) -> CommandResult<()> {
    let thumbnail_cache = state.loaded_thumbnails.clone();
    let path_cell = RefCell::new(path.to_string());

    std::thread::spawn(move || {
        let path_s = path_cell.into_inner();
        let result = imageops::get_image_descriptor(&*path_s).and_then(|(img, metadata)| {
            Ok(ImageDescriptor {
                metadata: metadata,
                thumbnail: imageops::generate_thumbnail_as_data_url(
                    &img,
                    thumbnail_width,
                    thumbnail_height,
                ),
            })
        });

        thumbnail_cache
            .write()
            .unwrap()
            .deref_mut()
            .insert(path_s, result.into());
    });
    Ok(()).into()
}

#[tauri::command]
fn image_descriptor(
    path: &str,
    state: State<'_, AppState>
) -> CommandResult<ImageDescriptor> {
    state.loaded_thumbnails
        .read()
        .ok()
        .and_then(|lock| lock.deref().get(path).map(|x| x.clone()))
        .unwrap_or(CommandResult::Error(CommandError {
            code: "not_cached".to_string(),
            message: "Image is not in cache".to_string()
        }))
    /*
    return Ok(ImageDescriptor {
        metadata: imageops::ImageMetadata {
            format: "TEST".to_string(),
            width: 10,
            height: 10,
            color_type: "rgba8".to_string(),
            channel_count: 1,
            bpp: 8,
            has_alpha: false,
            has_color: true
        },
        thumbnail: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png".to_string()
    }).into();
    */
}

fn main() {
    tauri::Builder::default()
        .manage(AppState { loaded_thumbnails: Arc::new(RwLock::new(HashMap::new())) })
        .invoke_handler(tauri::generate_handler![create_image_descriptor, image_descriptor])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
