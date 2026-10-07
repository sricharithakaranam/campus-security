export const API = "http://localhost:5000";
export const get = (p) => fetch(API + p).then((r) => r.json());
export const post = (p, body) =>
  fetch(API + p, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
