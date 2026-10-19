use axum::body::Bytes;
use axum::extract::{Path, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use futures_util::StreamExt;

#[derive(ocel::Resources, Clone)]
struct Infra {
    uploads: ocel::Bucket,
}

struct AppError(StatusCode, String);

impl From<ocel::Error> for AppError {
    fn from(err: ocel::Error) -> Self {
        let status = match err {
            ocel::Error::NotFound { .. } => StatusCode::NOT_FOUND,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        };
        Self(status, err.to_string())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (self.0, self.1).into_response()
    }
}

async fn put_file(
    State(infra): State<Infra>,
    Path(key): Path<String>,
    body: Bytes,
) -> Result<StatusCode, AppError> {
    infra.uploads.put(&key, body.to_vec()).await?;
    Ok(StatusCode::NO_CONTENT)
}

async fn get_file(
    State(infra): State<Infra>,
    Path(key): Path<String>,
) -> Result<Response, AppError> {
    let file = infra.uploads.get(&key).await?;
    let content_type = file.info().content_type.clone();
    let bytes = file.bytes().await?;
    Ok(([(header::CONTENT_TYPE, content_type)], bytes).into_response())
}

async fn list_files(State(infra): State<Infra>) -> Result<Json<Vec<String>>, AppError> {
    let mut keys = Vec::new();
    let mut objects = std::pin::pin!(infra.uploads.list().into_stream());
    while let Some(object) = objects.next().await {
        keys.push(object?.key);
    }
    Ok(Json(keys))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let infra = Infra::load().expect("the resources this app declares");
    let app = Router::new()
        .route("/files", get(list_files))
        .route("/files/{*key}", get(get_file).put(put_file))
        .with_state(infra);
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
