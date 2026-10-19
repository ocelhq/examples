use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Serialize, Deserialize)]
struct Render {
    scene: String,
}

async fn warm_up() -> Result<(), ocel::RunError> {
    println!("worker started");
    Ok(())
}

async fn log_run(run: &ocel::Run, next: ocel::Next<'_>) -> Result<(), ocel::RunError> {
    println!("{:?} {} started", run.kind(), run.name());
    let result = next.await;
    println!("{:?} {} finished", run.kind(), run.name());
    result
}

#[derive(ocel::Resources, Clone)]
struct Infra {
    #[ocel(name = "media", concurrency = 2, on_start = warm_up, middleware = log_run)]
    media: ocel::Worker,
    renders: ocel::Topic<Render>,
}

#[ocel::task(worker = "media")]
async fn render(scene: Render, _run: &ocel::Run) -> Result<String, ocel::RunError> {
    Ok(format!("rendered {}", scene.scene))
}

#[ocel::consumer(topic = Infra::RENDERS, worker = "media")]
async fn announce(scene: Render, _run: &ocel::Run) -> Result<(), ocel::RunError> {
    println!("queued {}", scene.scene);
    Ok(())
}

fn failed(err: ocel::Error) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}

async fn start(
    State(infra): State<Infra>,
    Json(scene): Json<Render>,
) -> Result<Json<Value>, (StatusCode, String)> {
    infra
        .renders
        .send(Render {
            scene: scene.scene.clone(),
        })
        .await
        .map_err(failed)?;
    let run = render.trigger(scene).await.map_err(failed)?;
    Ok(Json(json!({ "run": run.id })))
}

async fn status(Path(id): Path<String>) -> Result<Json<Value>, (StatusCode, String)> {
    let run = ocel::runs::retrieve(&id).await.map_err(failed)?;
    Ok(Json(json!({
        "status": run.status.map(|status| format!("{status:?}")),
        "output": run.output,
    })))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/renders", post(start))
        .route("/renders/{id}", get(status))
        .with_state(Infra::load().expect("the resources this app declares"));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
