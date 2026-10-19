use std::sync::Arc;
use std::time::Duration;

use axum::extract::{Path, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::Row;
use tokio::sync::OnceCell;

#[derive(ocel::KvKey)]
#[ocel(pattern = "idempotency/:key", text, ttl = "24h")]
struct IdempotencyKey {
    key: String,
}

#[derive(ocel::Resources, Clone)]
struct Infra {
    #[ocel(name = "jobs")]
    db: ocel::Postgres,
    #[ocel(name = "idempotency", entries = [IdempotencyKey])]
    keys: ocel::Kv,
}

#[derive(Serialize, Deserialize)]
struct Report {
    job_id: String,
    rows: u32,
}

static INFRA: OnceCell<Infra> = OnceCell::const_new();

async fn infra() -> &'static Infra {
    INFRA
        .get_or_init(|| async { Infra::load().expect("the resources this app declares") })
        .await
}

// The task runs on the worker role of this same binary, so it loads the resources itself.
#[ocel::task(retry(max_attempts = 3, min_delay = "2s", max_delay = "30s"))]
async fn build_report(report: Report, _run: &ocel::Run) -> Result<Value, ocel::RunError> {
    let pool = infra().await.db.pool().await.map_err(ocel::RunError::new)?;
    sqlx::query("update jobs set status = 'running', updated_at = now() where id = $1::uuid")
        .bind(&report.job_id)
        .execute(pool)
        .await
        .map_err(ocel::RunError::new)?;

    tokio::time::sleep(Duration::from_secs(5)).await;

    let result = json!({ "rows_processed": report.rows });
    sqlx::query(
        "update jobs set status = 'succeeded', result = $2, updated_at = now() where id = $1::uuid",
    )
    .bind(&report.job_id)
    .bind(&result)
    .execute(pool)
    .await
    .map_err(ocel::RunError::new)?;
    Ok(result)
}

#[derive(Deserialize)]
struct NewJob {
    rows: u32,
}

async fn create_job(
    State(infra): State<Arc<Infra>>,
    headers: HeaderMap,
    Json(new): Json<NewJob>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let internal = |err: &dyn std::fmt::Display| (StatusCode::BAD_GATEWAY, err.to_string());
    let idempotency = headers
        .get("idempotency-key")
        .and_then(|value| value.to_str().ok())
        .map(|key| IdempotencyKey {
            key: key.to_string(),
        });

    if let Some(key) = &idempotency {
        if let Some(job_id) = infra
            .keys
            .entry(IdempotencyKey {
                key: key.key.clone(),
            })
            .get()
            .await
            .map_err(|e| internal(&e))?
        {
            return Ok((
                StatusCode::OK,
                Json(json!({ "id": job_id, "replayed": true })),
            ));
        }
    }

    let pool = infra.db.pool().await.map_err(|e| internal(&e))?;
    let job_id: String =
        sqlx::query("insert into jobs (rows_requested) values ($1) returning id::text")
            .bind(new.rows as i32)
            .fetch_one(pool)
            .await
            .map_err(|e| internal(&e))?
            .get(0);

    let run = build_report
        .trigger(Report {
            job_id: job_id.clone(),
            rows: new.rows,
        })
        .await
        .map_err(|e| internal(&e))?;
    sqlx::query("update jobs set run_id = $2 where id = $1::uuid")
        .bind(&job_id)
        .bind(&run.id)
        .execute(pool)
        .await
        .map_err(|e| internal(&e))?;

    if let Some(key) = idempotency {
        infra
            .keys
            .entry(key)
            .set(job_id.clone())
            .await
            .map_err(|e| internal(&e))?;
    }
    Ok((
        StatusCode::ACCEPTED,
        Json(json!({ "id": job_id, "replayed": false })),
    ))
}

async fn get_job(
    State(infra): State<Arc<Infra>>,
    Path(id): Path<String>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let internal = |err: &dyn std::fmt::Display| (StatusCode::BAD_GATEWAY, err.to_string());
    let pool = infra.db.pool().await.map_err(|e| internal(&e))?;
    let row = sqlx::query(
        "select status, run_id, result, created_at::text as created_at from jobs where id::text = $1",
    )
    .bind(&id)
    .fetch_optional(pool)
    .await
    .map_err(|e| internal(&e))?
    .ok_or((StatusCode::NOT_FOUND, "no such job".to_string()))?;

    let run_id: Option<String> = row.get("run_id");
    let attempts = match &run_id {
        Some(run_id) => ocel::runs::retrieve(run_id)
            .await
            .ok()
            .map(|run| run.attempts),
        None => None,
    };
    Ok(Json(json!({
        "id": id,
        "status": row.get::<String, _>("status"),
        "result": row.get::<Option<Value>, _>("result"),
        "attempts": attempts,
        "created_at": row.get::<String, _>("created_at"),
    })))
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let infra = infra().await.clone();
    let pool = infra.db.pool().await.expect("the jobs database");
    sqlx::query(
        "create table if not exists jobs (
            id uuid primary key default gen_random_uuid(),
            status text not null default 'queued',
            rows_requested int not null,
            run_id text,
            result jsonb,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
        )",
    )
    .execute(pool)
    .await
    .expect("the jobs table");

    let app = Router::new()
        .route("/jobs", post(create_job))
        .route("/jobs/{id}", get(get_job))
        .with_state(Arc::new(infra));

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    axum::serve(listener, app).await.expect("serve");
}
