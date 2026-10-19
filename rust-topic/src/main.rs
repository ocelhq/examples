use std::sync::{Arc, Mutex};

use axum::extract::State;
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Order {
    item: String,
}

#[derive(ocel::Resources)]
struct Infra {
    orders: ocel::Topic<Order>,
}

#[ocel::consumer(topic = Infra::ORDERS)]
async fn log_order(order: Order, run: &ocel::Run) -> Result<(), ocel::RunError> {
    println!("order for {} (message {})", order.item, run.message().id);
    Ok(())
}

#[derive(Clone)]
struct App {
    infra: Arc<Infra>,
    sent: Arc<Mutex<Vec<String>>>,
}

async fn place_order(
    State(app): State<App>,
    Json(order): Json<Order>,
) -> Result<Json<String>, (StatusCode, String)> {
    let id = app
        .infra
        .orders
        .send(order)
        .await
        .map_err(|err| (StatusCode::INTERNAL_SERVER_ERROR, err.to_string()))?;
    app.sent.lock().unwrap().push(id.clone());
    Ok(Json(id))
}

async fn sent(State(app): State<App>) -> Json<Vec<String>> {
    Json(app.sent.lock().unwrap().clone())
}

#[ocel::main]
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/orders", get(sent).post(place_order))
        .with_state(App {
            infra: Arc::new(Infra::load().expect("the resources this app declares")),
            sent: Arc::default(),
        });
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind");
    println!("listening on http://localhost:{port}");
    axum::serve(listener, app).await.expect("serve");
}
