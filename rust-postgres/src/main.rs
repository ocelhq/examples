use axum::extract::State;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};

#[derive(ocel::Resources, Clone)]
struct Infra {
    #[ocel(name = "main")]
    db: ocel::Postgres,
}

#[derive(Deserialize)]
struct NewNote {
    text: String,
}

#[derive(Serialize, sqlx::FromRow)]
struct Note {
    id: i32,
    text: String,
}

struct AppError(String);

impl<E: std::fmt::Display> From<E> for AppError {
    fn from(err: E) -> Self {
        Self(err.to_string())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, self.0).into_response()
    }
}

async fn add_note(
    State(infra): State<Infra>,
    Json(note): Json<NewNote>,
) -> Result<Json<Note>, AppError> {
    let pool = infra.db.pool().await?;
    let note = sqlx::query_as("insert into notes (text) values ($1) returning id, text")
        .bind(note.text)
        .fetch_one(pool)
        .await?;
    Ok(Json(note))
}

async fn list_notes(State(infra): State<Infra>) -> Result<Json<Vec<Note>>, AppError> {
    let pool = infra.db.pool().await?;
    let notes = sqlx::query_as("select id, text from notes order by id")
        .fetch_all(pool)
        .await?;
    Ok(Json(notes))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let infra = Infra::load().expect("the resources this app declares");
    sqlx::query("create table if not exists notes (id serial primary key, text text not null)")
        .execute(infra.db.pool().await.expect("the database"))
        .await
        .expect("the notes table");

    let app = Router::new()
        .route("/notes", get(list_notes).post(add_note))
        .with_state(infra);
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
