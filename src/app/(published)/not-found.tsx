/** Plain and unbranded: it is not our place to advertise on a customer's domain. */
export default function PublishedNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
        font: "16px/1.6 system-ui, sans-serif",
        color: "#16181c",
        background: "#fff",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 26 }}>Not found</h1>
        <p style={{ color: "#5c6169" }}>There is no page at this address.</p>
      </div>
    </div>
  );
}
