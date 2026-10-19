use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

async fn index() -> &'static str {
    "Hello from Rust\n"
}

async fn hello() -> Json<Value> {
    Json(json!({ "message": "Hello from Rust" }))
}

#[tokio::main]
async fn main() {
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let app = Router::new()
        .route("/", get(index))
        .route("/api/hello", get(hello));
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
