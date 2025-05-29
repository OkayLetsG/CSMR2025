// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_sql::{Builder, Migration, MigrationKind};
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _migrations = vec![
        Migration {
            version: 1,
            description: "created_folders_table",
            sql: "CREATE TABLE IF NOT EXISTS FOLDERS (
									FID INTEGER PRIMARY KEY AUTOINCREMENT,
									FNAME TEXT NOT NULL,
									FPARENT_ID INTEGER,
									FCREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
									FMODIFIED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    FGUID TEXT NOT NULL,
									FOREIGN KEY (FPARENT_ID) REFERENCES FOLDERS(FID) ON DELETE CASCADE,
                                    FOREIGN KEY (FPARENT_ID) REFERENCES FOLDERS(FID) ON UPDATE CASCADE
                )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "created_snippets_table",
            sql: "CREATE TABLE IF NOT EXISTS SNIPPETS (
									SID INTEGER PRIMARY KEY AUTOINCREMENT,
									STITLE TEXT NOT NULL,
									SCREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
									SMODIFIED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
									SFID INTEGER,
                                    SLNAME TEXT,
                                    SDOCS TEXT,
                                    SGUID TEXT NOT NULL,
									FOREIGN KEY (SFID) REFERENCES FOLDERS(FID) ON DELETE CASCADE
				)",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "created_fragments_table",
            sql: "CREATE TABLE IF NOT EXISTS FRAGMENTS (
									FRID INTEGER PRIMARY KEY AUTOINCREMENT,
									FRSID INTEGER NOT NULL,
									FRNAME TEXT NOT NULL,
									FRCONTENT TEXT,
									FRCREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
									FRMODIFIED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    FRGUID TEXT NOT NULL,
									FOREIGN KEY (FRSID) REFERENCES SNIPPETS(SID) ON DELETE CASCADE
								)",
            kind: MigrationKind::Up,
        }
    ];
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:csmremasterd2025_database.db", _migrations)
                .build(),
        )
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
