use aws_sdk_s3 as s3;
use axum::{
    extract::Path,
    http::{header::HeaderMap, StatusCode},
    response::{Html, IntoResponse, Redirect},
    routing::{get, post},
    Form, Json, Router,
};
use bytes::Bytes;
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use std::str;

#[derive(Clone)]
pub struct AppConfig {
    pub s3_client: s3::client::Client,
}

use git2::{Cred, Error, RemoteCallbacks};
use std::env;

const REPO_PATH: &str = "./data-repo";
const REPO_URL: &str = "git@github.com:adbrowne/brownie-tracker-data.git";
async fn ensure_repo_cloned() -> () {
    if !std::path::Path::new(REPO_PATH).exists() {
        clone_repo().await;
    }
}
async fn clone_repo() -> () {
    // Prepare callbacks.
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        Cred::ssh_key(
            username_from_url.unwrap(),
            None,
            std::path::Path::new(&format!("{}/.ssh/id_rsa", env::var("HOME").unwrap())),
            None,
        )
    });

    // Prepare fetch options.
    let mut fo = git2::FetchOptions::new();
    fo.remote_callbacks(callbacks);

    // Prepare builder.
    let mut builder = git2::build::RepoBuilder::new();
    builder.fetch_options(fo);

    // Clone the project.
    builder
        .clone(REPO_URL, std::path::Path::new(REPO_PATH))
        .unwrap();
}

#[tokio::main]
async fn main() {
    ensure_repo_cloned().await;
    let config = aws_config::load_from_env().await;
    let s3_client = aws_sdk_s3::Client::new(&config);

    let server_config = AppConfig { s3_client };
    // build our application with a route
    let app = Router::new()
        // `GET /` goes to `root`
        .route("/", get(root))
        .route("/day/:date/", get(day))
        .route("/day/:data/update", post(update))
        .with_state(server_config);

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

fn get_file_path(date: String) -> String {
    format!("{}/{}.txt", REPO_PATH, date)
}

// basic handler that responds with a static string
async fn day(Path((date)): Path<(String)>) -> Result<Html<String>, StatusCode> {
    let s = match std::fs::read_to_string(get_file_path(date)) {
        Ok(text) => text,
        Err(_err) => String::from(""),
    };
    let content = format!("<html>
        <head>
            <script src=\"https://unpkg.com/htmx.org@2.0.2\" integrity=\"sha384-Y7hw+L/jvKeWIRRkqWYfPcvVxHzVzn5REgzbawhxAuQGwX1XWe70vji+VSeHOThJ\" crossorigin=\"anonymous\"></script>
            <style>
                .wrapper {{
                    padding: 20px;
                    margin: 15px 0;
                    background-color: #0f9d58;
                }}

                textarea {{
                    font-size: 20px;
                    width: 100%;
                }}
            </style>
        </head>
        <body>
            <form method=\"POST\" action=\"./update\">
                <textarea cols=\"120\" rows=\"20\" name=\"content\">{}</textarea>
                <input type=\"submit\"></input>
            </form>
        </body>
    </html>", s);
    Ok(Html(content))
}

async fn root() -> Redirect {
    //println!("{?}", headers);
    let uk_timezone = FixedOffset::east_opt(1 * 60 * 60).unwrap();
    let current_time_utc = Utc::now();
    let current_time_uk = current_time_utc.with_timezone(&uk_timezone);
    let current_time_uk_str = current_time_uk.format("%Y-%m-%d");
    let redirect_url = format!("/day/{}/", current_time_uk_str);
    Redirect::to(&redirect_url)
}

async fn update(
    // this argument tells axum to parse the request body
    // as JSON into a `CreateUser` type
    Path(date): Path<String>,
    Form(payload): Form<UpdateData>,
) -> Redirect {
    println!("{:?}", payload);

    std::fs::write(get_file_path(date), payload.content).unwrap();
    Redirect::to("/")
}

// the input to our `create_user` handler
#[derive(Deserialize, Debug)]
struct UpdateData {
    content: String,
}
