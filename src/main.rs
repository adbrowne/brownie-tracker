use serde::Deserialize;
use axum::{
    body::Body,
    extract::{Path, Request},
    http::{header::HeaderMap, HeaderName, HeaderValue, StatusCode, Uri},
    middleware::{self, Next},
    response::{Html, Redirect, Response},
    routing::{get, post},
    Form, Router, Json,
};
use chrono::prelude::*;
use std::str::{self, FromStr};
use tower_http::services::ServeDir;

use git2::{Cred, RemoteCallbacks};
use std::env;

const REPO_PATH: &str = "./data-repo";
const REPO_URL: &str = "git@github.com:adbrowne/brownie-tracker-data.git";
async fn ensure_repo_cloned() {
    if !std::path::Path::new(REPO_PATH).exists() {
        clone_repo().await;
    }
}
async fn clone_repo() {
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

    // build our application with a route
    let app = Router::new()
        .route("/", get(root))
        .route("/api/day/:date", get(get_date))
        .route("/api/day/:date", post(post_date))
        .route("/day/:date/", get(get_static_file))
        .fallback_service(ServeDir::new("client/dist"))
        .layer(middleware::from_fn(my_auth_middleware))
        .route("/login", post(login_post))
        .route("/login", get(login));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_static_file() -> Result<Html<String>, StatusCode> {
    match std::fs::read_to_string("./client/dist/index.html") {
        Ok(text) => Ok(Html(text)),
        Err(_err) => Ok(Html(String::from("file not found"))),
    }
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

const AUTH_COOKIE_NAME: &str = "tracker_auth";
const AUTH_COOKIE_VALUE: &str = "b8b0cd92-3f2a-4a01-ab6a-6c8d96b12732";

async fn login() -> Result<Html<String>, StatusCode> {
    let content = "<html>
        <body>
            <form method=\"POST\" action=\"./login\">
                <input type=\"password\" name=\"password\"></input>
                <input type=\"submit\"></input>
            </form>
        </body>
    </html>"
        .to_string();
    Ok(Html(content))
}

fn login_response() -> Response {
    Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header("Location", "/login")
        .body(Body::from(""))
        .unwrap()
}

async fn my_auth_middleware(request: Request, next: Next) -> axum::response::Response {
    println!("running middleware");
    let cookie_header = request.headers().get("Cookie");
    match cookie_header {
        Some(cookies) => {
            return match str::from_utf8(cookies.as_bytes()) {
                Ok(s) => {
                    let expected_cookie = format!("{AUTH_COOKIE_NAME}={AUTH_COOKIE_VALUE}");
                    if s.contains(&expected_cookie) {
                        let response = next.run(request).await;
                        return response;
                    } else {
                        return login_response();
                    }
                }
                Err(_e) => login_response(),
            }
        }
        None => login_response(),
    }
}

fn redirect_to_login() -> (StatusCode, HeaderMap, &'static str) {
    let key = HeaderName::from_str("Location").unwrap();
    let mut headers = HeaderMap::new();
    headers.insert(key, HeaderValue::from_static("/login"));
    (StatusCode::SEE_OTHER, headers, "")
}

async fn login_post(Form(payload): Form<LoginData>) -> (StatusCode, HeaderMap, &'static str) {
    let mut headers = HeaderMap::new();
    if payload.password == "abcd1234" {
        let cookie_value: &str =
            &format!("{AUTH_COOKIE_NAME}={AUTH_COOKIE_VALUE}; Secure; HttpOnly");
        headers.insert(
            HeaderName::from_str("Set-Cookie").unwrap(),
            HeaderValue::from_str(cookie_value).unwrap(),
        );
        headers.insert(
            HeaderName::from_str("Location").unwrap(),
            HeaderValue::from_static("/"),
        );
        (StatusCode::SEE_OTHER, headers, "")
    } else {
        return redirect_to_login();
    }
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

async fn get_date(Path(date) : Path<String>) -> Response {
    let s = match std::fs::read_to_string(get_file_path(date)) {
        Ok(text) => text,
        Err(_err) => String::from(""),
    };
    Response::builder()
        .status(StatusCode::OK)
        .header("Content-type", "application/json")
        .body(Body::from(s))
        .unwrap()
}

async fn post_date(
    // this argument tells axum to parse the request body
    // as JSON into a `CreateUser` type
    Path(date): Path<String>,
    Json(payload): Json<UpdateData>,
) -> StatusCode {
    println!("{:?}", payload);

    std::fs::write(get_file_path(date), payload.content).unwrap();
    StatusCode::OK
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
struct LoginData {
    password: String,
}

// the input to our `create_user` handler
#[derive(Deserialize, Debug)]
struct UpdateData {
    content: String,
}
