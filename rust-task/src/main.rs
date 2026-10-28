use axum::extract::Path;
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize)]
struct Document {
    text: String,
}

#[derive(Serialize, Deserialize)]
struct Summary {
    words: usize,
}

#[ocel::task(retry(max_attempts = 3))]
async fn summarize(document: Document, _run: &ocel::Run) -> Result<Summary, ocel::RunError> {
    Ok(Summary {
        words: document.text.split_whitespace().count(),
    })
}

fn failed(err: ocel::Error) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

async fn start(Json(document): Json<Document>) -> Result<Json<Value>, (StatusCode, String)> {
    let run = summarize.trigger(document).await.map_err(failed)?;
    Ok(Json(json!({ "run": run.id })))
}

async fn status(Path(id): Path<String>) -> Result<Json<Value>, (StatusCode, String)> {
    let run = ocel::runs::retrieve(&id).await.map_err(failed)?;
    Ok(Json(json!({
        "status": run.status.map(|status| format!("{status:?}")),
        "output": run.output,
        "attempts": run.attempts,
    })))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/summaries", post(start))
        .route("/summaries/{id}", get(status));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
