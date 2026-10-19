use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use serde_json::{json, Value};

#[derive(ocel::Env, Clone)]
struct Env {
    #[ocel(default = "hello")]
    greeting: String,
    api_key: ocel::Secret,
}

async fn greeting(State(env): State<Env>) -> Json<Value> {
    Json(json!({ "greeting": env.greeting }))
}

async fn api_key(State(env): State<Env>) -> Json<Value> {
    let length = env.api_key.value().map(|key| key.len()).ok();
    Json(json!({ "api_key_length": length }))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/greeting", get(greeting))
        .route("/api-key", get(api_key))
        .with_state(Env::load().expect("the environment this app declares"));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
