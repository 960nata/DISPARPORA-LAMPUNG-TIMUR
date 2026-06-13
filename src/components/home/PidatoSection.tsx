"use client";

const defaultBupatiSpeechData = {
  name: "M. Dawam Rahardjo",
  title: "Bupati Lampung Timur",
  photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=500&q=80",
  welcomeSpeech: "Tabik Pun! Selamat datang di Portal Wisata resmi Kabupaten Lampung Timur. Kami mengundang seluruh wisatawan untuk datang dan menyaksikan sendiri kekayaan alam liar yang mempesona di Taman Nasional Way Kambas, keindahan bahari pantai pesisir timur, serta peninggalan prasejarah yang bernilai tinggi. Lampung Timur terus berinovasi dalam memajukan pemuda, olahraga, dan industri ekonomi kreatif lokal demi mewujudkan masyarakat yang sejahtera dan berbudaya."
};

export default function PidatoSection() {
  return (
    <section className="container">
      <div className="card" style={{
        padding: "3rem",
        display: "flex",
        gap: "3rem",
        flexWrap: "wrap",
        alignItems: "center",
        background: "linear-gradient(to right, #ffffff, #f0fdf4)",
        border: "1px solid var(--border)"
      }}>
        {/* Portrait Column */}
        <div style={{ flex: "1 1 250px", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              right: "-10px",
              bottom: "-10px",
              backgroundColor: "var(--primary-light)",
              borderRadius: "16px",
              zIndex: 1
            }} />
            <img
              src={defaultBupatiSpeechData.photoUrl}
              alt={defaultBupatiSpeechData.name}
              style={{
                width: "240px",
                height: "300px",
                objectFit: "cover",
                borderRadius: "16px",
                zIndex: 2,
                position: "relative",
                boxShadow: "var(--card-shadow)"
              }}
            />
          </div>
        </div>

        {/* Message Column */}
        <div style={{ flex: "2 1 400px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <span className="badge badge-success" style={{ alignSelf: "flex-start" }}>Sambutan Kepala Daerah</span>
          <h3 style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-serif)" }}>
            Selamat Datang di Lampung Timur
          </h3>
          <p style={{
            fontSize: "1.05rem",
            lineHeight: "1.8",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            borderLeft: "4px solid var(--primary)",
            paddingLeft: "1.25rem"
          }}>
            "{defaultBupatiSpeechData.welcomeSpeech}"
          </p>
          <div style={{ marginTop: "1rem" }}>
            <h5 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{defaultBupatiSpeechData.name}</h5>
            <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 700 }}>{defaultBupatiSpeechData.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
