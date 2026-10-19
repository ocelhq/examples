use std::convert::Infallible;
use std::sync::Arc;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::post;
use axum::{Json, Router};
use ocel::realtime::{Realtime, Request, SubscribeContext};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct OrderEvent {
    status: String,
}

#[derive(ocel::Channel)]
#[ocel(realtime = "app", pattern = "orders/:order_id", event = OrderEvent)]
struct Orders {
    order_id: String,
}

fn build_realtime() -> Realtime {
    Realtime::builder("app")
        // Decide who the caller is from your own session; this one admits everyone.
        .authorize(|_: Arc<Request>| async { Ok::<_, Infallible>(Some(())) })
        .subscribe::<Orders>(|_: SubscribeContext<(), Orders>| async { Ok::<_, Infallible>(true) })
        .build()
        .expect("the realtime resource this app declares")
}

async fn ship(
    State(realtime): State<Realtime>,
    Path(order_id): Path<String>,
    Json(event): Json<OrderEvent>,
) -> Result<StatusCode, (StatusCode, String)> {
    realtime
        .publish(&Orders { order_id }, &event)
        .await
        .map_err(|err| (StatusCode::BAD_GATEWAY, err.to_string()))?;
    Ok(StatusCode::NO_CONTENT)
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let realtime = build_realtime();
    let app = Router::new()
        .route("/orders/{order_id}/events", post(ship))
        .with_state(realtime.clone())
        .nest_service("/api/realtime", ocel::realtime::axum::router(realtime));
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
