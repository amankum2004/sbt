const Poster = () => {
  const posterUrl = "/salonHub-Poster.png";

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>SalonHub Poster</h2>

      <img
        src={posterUrl}
        alt="SalonHub Poster"
        style={styles.poster}
      />

      <a
        href={posterUrl}
        download="SalonHub-Poster.png"
        style={styles.downloadBtn}
      >
        ⬇ Download Poster
      </a>
    </div>
  );
};

export default Poster;

const styles = {
  container: {
    padding: "30px",
    textAlign: "center",
  },
  heading: {
    marginBottom: "20px",
    fontSize: "24px",
  },
  poster: {
    maxWidth: "100%",
    width: "400px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  downloadBtn: {
    display: "inline-block",
    marginTop: "20px",
    padding: "12px 24px",
    background: "#6C63FF",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
  },
};
