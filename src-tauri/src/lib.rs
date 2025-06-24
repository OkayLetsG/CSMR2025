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
                                    FLID INTEGER,
                                    FGUID TEXT NOT NULL,
									FOREIGN KEY (FPARENT_ID) REFERENCES FOLDERS(FID) ON DELETE CASCADE,
                                    FOREIGN KEY (FPARENT_ID) REFERENCES FOLDERS(FID) ON UPDATE CASCADE
                                    FOREIGN KEY (FLID) REFERENCES LANGUAGES(LID) ON DELETE CASCADE
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
                                    SLNAME TEXT NOT NULL,
                                    SLID INTEGER,
                                    SGUID TEXT NOT NULL,
									FOREIGN KEY (SFID) REFERENCES FOLDERS(FID) ON DELETE CASCADE
                                    FOREIGN KEY (SLID) REFERENCES LANGUAGES(LID) ON DELETE CASCADE
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
        },
        Migration {
            version: 4,
            description: "create_languages_table",
            sql: "CREATE TABLE IF NOT EXISTS LANGUAGES (
									LID INTEGER PRIMARY KEY AUTOINCREMENT,
									LKEY TEXT NOT NULL,
                                    LNAME TEXT NOT NULL,
                                    LSHOW INTEGER NOT NULL DEFAULT -1,
                                    LALLOW_DELETE INTEGER NOT NULL DEFAULT 0,
                                    LCREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
									LMODIFIED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    UNIQUE (LKEY, LNAME)
                )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "added_language_plaintext",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('plaintext','Text')
                  ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "added_language_abap",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('apab','APAB')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "added_language_apex",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('apex','Apex')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "added_language_azcli",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('azcli','Azure CLI')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "added_language_bat",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('bat','Bat')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "added_language_bicep",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('bicep','Bicep')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "added_language_cameligo",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('cameligo','Caml/Ligo')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "added_language_clojure",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('clojure','Clojure')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 13,
            description: "added_language_coffeescript",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('coffeescript','CoffeeScript')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 14,
            description: "added_language_c",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('c','C')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 15,
            description: "added_language_cpp",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('cpp','C++')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 16,
            description: "added_language_csharp",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('csharp','C#')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 17,
            description: "added_language_csp",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('csp','Content-Security-Policy')
                  ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "added_language_css",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('css','CSS')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 19,
            description: "added_language_cypher",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('cypher','Cypher')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 20,
            description: "added_language_dart",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('dart','Dart')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 21,
            description: "added_language_dockerfile",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('dockerfile','Dockerfile')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 22,
            description: "added_language_ecl",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('ecl','ECL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 23,
            description: "added_language_elixir",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('elixir','Elixir')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 24,
            description: "added_language_flow9",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('flow9','FLOW')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 25,
            description: "added_language_fsharp",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('fsharp','F#')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 26,
            description: "added_language_freemarker2",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('freemarker2','FreeMarker')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 27,
            description: "added_language_go",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('go','Go')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 28,
            description: "added_language_graphql",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('graphql','GraphQL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 29,
            description: "added_language_handlebars",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('handlebars','Handlebars')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 30,
            description: "added_language_hcl",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('hcl','HCL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 31,
            description: "added_language_html",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('html','HTML')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 32,
            description: "added_language_ini",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('ini','INI')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 33,
            description: "added_language_java",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('java','Java')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 34,
            description: "added_language_javascript",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('javascript','JavaScript')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 35,
            description: "added_language_julia",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('julia','Julia')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 36,
            description: "added_language_kotlin",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('kotlin','Kotlin')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 37,
            description: "added_language_less",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('less','Less')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 38,
            description: "added_language_lexon",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('lexon','Lexon')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 39,
            description: "added_language_lua",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('lua','Lua')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 40,
            description: "added_language_liquid",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('liquid','Liquid')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 41,
            description: "added_language_m3",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('m3','M3-(Macro Processor)')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 42,
            description: "added_language_markdown",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('markdown','Markdown')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 43,
            description: "added_language_mdx",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('mdx','MDX')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 44,
            description: "added_language_mips",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('mips','MIPS')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 45,
            description: "added_language_msdax",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('msdax','DAX-(Data Analysis Expressions)')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 46,
            description: "added_language_mysql",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('mysql','MySQL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 47,
            description: "added_language_objective_c",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('objective-c','Objective-C')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 48,
            description: "added_language_pascal",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('pascal','Pascal')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 49,
            description: "added_language_pascaligo",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('pascaligo','Pascaligo')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 50,
            description: "added_language_perl",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('perl','Perl')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 51,
            description: "added_language_pgsql",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('pgsql','PGSQL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 52,
            description: "added_language_php",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('php','PHP')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 53,
            description: "added_language_pla",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('pla','PLA')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 54,
            description: "added_language_postiats",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('postiats','ATS-Postiats')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 55,
            description: "added_language_powerquery",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('powerquery','Power-Query')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 56,
            description: "added_language_powershell",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('powershell','PowerShell')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 57,
            description: "added_language_proto",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('proto','Prototype-based Programming')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 58,
            description: "added_language_pug",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('pug','Pug')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 59,
            description: "added_language_python",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('python','Python')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 60,
            description: "added_language_qsharp",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('qsharp','Q#')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 61,
            description: "added_language_r",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('r','R')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 62,
            description: "added_language_razor",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('razor','ASP.NET-Razor')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 63,
            description: "added_language_redis",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('redis','Redis')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 64,
            description: "added_language_redshift",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('redshift','Redshift')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 65,
            description: "added_language_restructuredtext",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('restructuredtext','reStructuredText')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 66,
            description: "added_language_ruby",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('ruby','Ruby')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 67,
            description: "added_language_rust",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('rust','Rust')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 68,
            description: "added_language_sb",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('sb','Microsoft-Small-Basic')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 69,
            description: "added_language_scala",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('scala','Scala')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 70,
            description: "added_language_scheme",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('scheme','Scheme')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 71,
            description: "added_language_scss",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('scss','SCSS')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 72,
            description: "added_language_shell",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('shell','Shell')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 73,
            description: "added_language_sol",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('sol','Secure-Operations-Language')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 74,
            description: "added_language_aes",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('aes','Advanced-Encryption-Standard')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 75,
            description: "added_language_sparql",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('sparql','SPARQL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 76,
            description: "added_language_sql",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('sql','SQL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 77,
            description: "added_language_st",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('st','Structured-Text')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 78,
            description: "added_language_swift",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('swift','Swift')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 79,
            description: "added_language_systemverilog",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('systemverilog','SystemVerilog')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 80,
            description: "added_language_verilog",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('verilog','Verilog')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 81,
            description: "added_language_tcl",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('tcl','Tcl')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 82,
            description: "added_language_twig",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('twig','Twig')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 83,
            description: "added_language_typescript",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('typescript','TypeScript')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 84,
            description: "added_language_typespec",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('typespec','TypeSpec')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 85,
            description: "added_language_vb",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('vb','Visual-Basic')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 86,
            description: "added_language_wgsl",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('wgsl','WGSL')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 87,
            description: "added_language_xml",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('xml','XML')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 88,
            description: "added_language_yaml",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('yaml','YAML')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 89,
            description: "added_language_json",
            sql: "INSERT INTO LANGUAGES (LKEY, LNAME)
                  VALUES ('json','JSON')
                   ON CONFLICT(LKEY, LNAME) DO NOTHING",
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
