use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::{Json, Router};
use serde_json::{json, Value};

#[derive(ocel::KvKey)]
#[ocel(pattern = "hits/:page", counter)]
struct Hits {
    page: String,
}

#[derive(ocel::Resources, Clone)]
struct Infra {
    #[ocel(entries = [Hits])]
    cache: ocel::Kv,
}

struct AppError(String);

impl From<ocel::Error> for AppError {
    fn from(err: ocel::Error) -> Self {
        Self(err.to_string())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0).into_response()
    }
}

async fn hit(State(infra): State<Infra>, Path(page): Path<String>) -> Result<Json<Value>, AppError> {
    let hits = infra.cache.entry(Hits { page }).increment(1).await?;
    Ok(Json(json!({ "hits": hits })))
}

async fn count(State(infra): State<Infra>, Path(page): Path<String>) -> Result<Json<Value>, AppError> {
    let hits = infra.cache.entry(Hits { page }).get().await?.unwrap_or(0);
    Ok(Json(json!({ "hits": hits })))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let infra = Infra::load().expect("the resources this app declares");
    let app = Router::new()
        .route("/hits/{page}", post(hit).get(count))
        .with_state(infra);
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
