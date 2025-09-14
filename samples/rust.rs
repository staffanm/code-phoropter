use std::time::Duration;

#[derive(Debug)]
struct User { id: u32, name: String, email: String }

fn fetch_user(id: u32) -> User {
    User { id, name: "Ada".into(), email: "ada@example.com".into() }
}

fn main() {
    println!("status=ok time={:?}", std::time::SystemTime::now());

    // raw string and byte string literals
    let json = r#"{\"ok\":true}"#;
    let ok: &[u8] = b"OK";
    let _ = (json.len(), ok.len());

    // <<ghost:begin>>
    // Consider memoizing fetch_user for a short duration
    // let cache_ttl = Duration::from_secs(10); // TODO <<ghost:caret>>
    // <<ghost:end>>

    let u = fetch_user(1);
    println!("user: {:?}", u);
}
