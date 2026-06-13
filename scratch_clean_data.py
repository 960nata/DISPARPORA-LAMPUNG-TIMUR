import json
import random
import re

# Set random seed for reproducibility
random.seed(42)

# Kecamatan centers coordinates
KECAMATAN_COORDS = {
    "Sukadana": (-5.2514, 105.5451),
    "Labuhan Maringgai": (-5.3725, 105.8152),
    "Labuhan Ratu": (-5.1567, 105.7725),
    "Bandar Sribhawono": (-5.3123, 105.7684),
    "Sekampung Udik": (-5.3541, 105.4215),
    "Pekalongan": (-5.1023, 105.3712),
    "Pasir Sakti": (-5.4982, 105.7512),
    "Way Jepara": (-5.1843, 105.7198),
    "Mataram Baru": (-5.2543, 105.7812),
    "Braja Selebah": (-5.2012, 105.7892),
    "Melinting": (-5.3214, 105.7825),
    "Jabung": (-5.4523, 105.6512),
    "Marga Tiga": (-5.1523, 105.5012),
    "Batanghari": (-5.0512, 105.3512),
    "Batanghari Nuban": (-5.1232, 105.4523),
    "Purbolinggo": (-5.0523, 105.4812),
    "Way Bungur": (-5.0023, 105.6212),
    "Bumi Agung": (-5.1512, 105.6012),
    "Gunung Pelindung": (-5.4123, 105.7312),
    "Metro Kibang": (-5.1212, 105.3012),
    "Raman Utara": (-5.0012, 105.4812),
    "Sekampung": (-5.2023, 105.3812),
    "Waway Karya": (-5.3512, 105.5012)
}

def clean_wisata_manually():
    # We will hand-curate the lists from the text files because the original parsing
    # created separate entries for numbers and contact links due to PDF line wraps.
    
    # 1. WISATA ALAM
    wisata_alam = [
        {
            "id": "nature_1",
            "name": "Pantai Kerang Mas",
            "kecamatan": "Labuhan Maringgai",
            "address": "Desa Muara Gading Mas, Kecamatan Labuhan Maringgai",
            "facilities": ["Gazebo", "Sarana Ibadah", "Toilet & Ruang Ganti", "Tempat Sampah", "Loket & Area Parkir", "Menara Pantau", "Pasar Kuliner", "Kios Oleh-Oleh", "Sewa Perahu, Ban & ATV", "Aula", "Kios Cinderamata", "Air Bersih"],
            "contact": "082373804875",
            "map_link": "https://maps.app.goo.gl/VVVENtDDBFVABrxb9",
            "active": True
        },
        {
            "id": "nature_2",
            "name": "Taman Nasional Way Kambas",
            "kecamatan": "Labuhan Ratu",
            "address": "Kecamatan Labuhan Ratu",
            "facilities": ["Guest House", "Visitor Center", "Shelter", "Loket Tiket & Parkir", "Toko Souvenir", "Rumah Makan", "Teater Gajah", "Mushola", "Peta Wisata"],
            "contact": "081367230940",
            "map_link": "https://maps.app.goo.gl/yS49nEBE9Zr2Bjqs7",
            "active": True
        },
        {
            "id": "nature_3",
            "name": "Pantai Mutiara Baru",
            "kecamatan": "Labuhan Maringgai",
            "address": "Desa Karya Makmur, Kecamatan Labuhan Maringgai",
            "facilities": ["Gazebo", "Spot Selfie", "Toilet", "Sarana Ibadah", "Aula", "Kios Kuliner"],
            "contact": "081379151234",
            "map_link": "https://maps.app.goo.gl/svqw84uJmT12VKop6",
            "active": True
        },
        {
            "id": "nature_4",
            "name": "Sumber Mata Air Awet Muda",
            "kecamatan": "Labuhan Maringgai",
            "address": "Kecamatan Labuhan Maringgai",
            "facilities": ["Kolam Pemandian", "Jalan Setapak", "Toilet"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/17HCGC7Tv1ub7Gvj6",
            "active": True
        },
        {
            "id": "nature_5",
            "name": "Danau Beringin Indah",
            "kecamatan": "Sukadana",
            "address": "Desa Negara Nabung, Kecamatan Sukadana",
            "facilities": ["Toilet & Parkir", "Gazebo", "Loket", "Sarana Bermain Anak", "Panggung Pentas", "Spot Selfie", "Perahu & Kano", "Kios Kuliner"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/Rqc39f4ouNWfVTPS6",
            "active": False
        },
        {
            "id": "nature_6",
            "name": "Dam Negara Batin / Wanaba",
            "kecamatan": "Sukadana",
            "address": "Desa Sukadana Timur, Kecamatan Sukadana",
            "facilities": ["Gazebo", "Mushola", "Wahana Bermain Anak", "Listrik", "Perahu", "Sepeda Air", "Spot Selfie", "Dermaga", "Kios Kuliner", "Toilet"],
            "contact": "085371029143",
            "map_link": "https://maps.app.goo.gl/nHAhy6NVs1RzPJEaA",
            "active": True
        },
        {
            "id": "nature_7",
            "name": "Pantai Cemara Indah",
            "kecamatan": "Labuhan Maringgai",
            "address": "Kecamatan Labuhan Maringgai",
            "facilities": ["Gazebo", "Ruang Ganti"],
            "contact": "081321152260",
            "map_link": "https://maps.app.goo.gl/19tcdihPpu6Kra5K8",
            "active": True
        },
        {
            "id": "nature_8",
            "name": "Danau Way Jepara",
            "kecamatan": "Way Jepara",
            "address": "Kecamatan Way Jepara",
            "facilities": ["Gazebo", "Toilet"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/us97ap1FhaAK8Yn1A",
            "active": True
        },
        {
            "id": "nature_9",
            "name": "Way Guruh",
            "kecamatan": "Jabung",
            "address": "Kecamatan Jabung",
            "facilities": ["Gazebo", "Toilet", "Kolam Ikan", "Spot Selfie", "Sarana Ibadah", "Generator Listrik", "Lampu Taman", "Taman"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "nature_10",
            "name": "Dam Swadaya",
            "kecamatan": "Pekalongan",
            "address": "Desa Gondang Rejo, Kecamatan Pekalongan",
            "facilities": ["Bendungan", "Jembatan", "Spot Foto"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "nature_11",
            "name": "Dam Terbanggi Marga",
            "kecamatan": "Sukadana",
            "address": "Desa Terbanggi Marga, Kecamatan Sukadana",
            "facilities": ["Bendungan"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "nature_12",
            "name": "Pesanggrahan Curup",
            "kecamatan": "Mataram Baru",
            "address": "Desa Mataram Baru, Kecamatan Mataram Baru",
            "facilities": ["Pemandian Alam"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "nature_13",
            "name": "Hutan Mangrove Pasir Sakti",
            "kecamatan": "Pasir Sakti",
            "address": "Desa Purworejo, Kecamatan Pasir Sakti",
            "facilities": ["Jembatan Mangrove", "Spot Foto", "Toilet"],
            "contact": "081274794591",
            "map_link": "https://maps.app.goo.gl/5UHRdjdQRx75Z2uk9",
            "active": True
        },
        {
            "id": "nature_14",
            "name": "Wisata Kali Alam",
            "kecamatan": "Bandar Sribhawono",
            "address": "Desa Sri Menanti, Kecamatan Bandar Sribhawono",
            "facilities": ["Spot Selfie", "Sumur Bor", "Gazebo", "Sarana Ibadah", "Safety Guard", "Pelampung", "Perahu Arung Jeram"],
            "contact": "085279608822",
            "map_link": "https://maps.app.goo.gl/rKAWLz9YKTQHEJmQ9",
            "active": True
        },
        {
            "id": "nature_15",
            "name": "Desa Wisata Labuhan Ratu VII",
            "kecamatan": "Labuhan Ratu",
            "address": "Desa Labuhan Ratu VII, Kecamatan Labuhan Ratu",
            "facilities": ["Edukasi Gajah", "Homestay", "Pemandu Wisata", "Pusat Informasi"],
            "contact": "081274251354",
            "map_link": "https://maps.app.goo.gl/Z5vqdp8XFfak9kza8?g_st=aw",
            "active": True
        },
        {
            "id": "nature_16",
            "name": "Desa Wisata Braja Harjosari / Padang Savana",
            "kecamatan": "Braja Selebah",
            "address": "Desa Braja Harjosari, Kecamatan Braja Selebah",
            "facilities": ["Padang Savana", "Edukasi Gajah & Badak", "Homestay", "Seni Budaya"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/McyAeTUpFLtdPq988",
            "active": True
        }
    ]

    # 2. WISATA BUATAN
    wisata_buatan = [
        {
            "id": "built_1",
            "name": "Danau Kemuning",
            "kecamatan": "Bandar Sribhawono",
            "address": "Desa Sribhawono, Kecamatan Bandar Sribhawono",
            "facilities": ["Toilet", "Gazebo", "Kios Kuliner", "Wahana Bebek-bebekan", "Sewa Ban"],
            "contact": "081369212248",
            "map_link": "https://maps.app.goo.gl/FezmgNnuKAC2dukL9",
            "active": True
        },
        {
            "id": "built_2",
            "name": "Pasar Wedana / Pasar Digital",
            "kecamatan": "Sukadana",
            "address": "Kecamatan Sukadana",
            "facilities": ["Spot Selfie", "Kios Kuliner", "Toilet", "Area Parkir"],
            "contact": "082269099379",
            "map_link": "https://maps.app.goo.gl/LGp1yT3KMN1KyqwC9",
            "active": True
        },
        {
            "id": "built_3",
            "name": "Islamic Center Lampung Timur",
            "kecamatan": "Sukadana",
            "address": "Kecamatan Sukadana",
            "facilities": ["Masjid Agung", "Gedung Serba Guna", "Kios Kuliner", "Toilet", "Spot Selfie", "Area Parkir"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/QgdKipuqtYqjnpuk9",
            "active": True
        },
        {
            "id": "built_4",
            "name": "Embung Bojong Katon Negeri Sakti",
            "kecamatan": "Sekampung Udik",
            "address": "Desa Bojong, Kecamatan Sekampung Udik",
            "facilities": ["Embung", "Gazebo"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_5",
            "name": "Balai Benih Induk (BBI) Hortikultura",
            "kecamatan": "Pekalongan",
            "address": "Kecamatan Pekalongan",
            "facilities": ["Kawasan Edukasi Pertanian", "Kebun Pembibitan"],
            "contact": "",
            "map_link": "",
            "active": True
        },
        {
            "id": "built_6",
            "name": "Agrowisata Kelompok Tani Lebah",
            "kecamatan": "Batanghari",
            "address": "Desa Buana Sakti, Kecamatan Batanghari",
            "facilities": ["Peternakan Lebah Madu", "Edukasi Madu"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_7",
            "name": "Agrowisata Buah Jeruk",
            "kecamatan": "Sekampung Udik",
            "address": "Desa Pugung Raharjo, Kecamatan Sekampung Udik",
            "facilities": ["Kebun Jeruk", "Petik Buah Mandiri"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_8",
            "name": "Agrowisata Bunga / Sayur-sayuran",
            "kecamatan": "Sekampung Udik",
            "address": "Desa Gunung Pasir Jaya, Kecamatan Sekampung Udik",
            "facilities": ["Taman Bunga", "Kebun Sayuran"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_9",
            "name": "Randu Mas",
            "kecamatan": "Sekampung Udik",
            "address": "Desa Pugung Raharjo, Kecamatan Sekampung Udik",
            "facilities": ["Water Boom", "Kolam Renang Anak & Dewasa", "Toilet & Kamar Bilas", "Restoran", "Aula Pertemuan", "Spot Selfie", "Area Parkir", "Mushola"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/EKLVqHMASqJiAdGe6",
            "active": True
        },
        {
            "id": "built_10",
            "name": "Rumah Fosil (Kuliner)",
            "kecamatan": "Marga Tiga",
            "address": "Kecamatan Marga Tiga",
            "facilities": ["Kuliner Khas", "Koleksi Fosil Kayu"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_11",
            "name": "Alam Jembat Kembar",
            "kecamatan": "Pasir Sakti",
            "address": "Kecamatan Pasir Sakti",
            "facilities": ["Gazebo", "Kolam Ikan", "Kuliner Ikan"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_12",
            "name": "Wahana Karya Tani",
            "kecamatan": "Batanghari",
            "address": "Kecamatan Batanghari",
            "facilities": ["Restoran & Area Swafoto"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_13",
            "name": "Gerebeq Ayem",
            "kecamatan": "Mataram Baru",
            "address": "Kecamatan Mataram Baru",
            "facilities": ["Kuliner Tradisional"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_14",
            "name": "Sarung Manggung",
            "kecamatan": "Batanghari",
            "address": "Kecamatan Batanghari",
            "facilities": ["Kios Makanan & Kerajinan"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_15",
            "name": "Teman Jalan",
            "kecamatan": "Sekampung",
            "address": "Kecamatan Sekampung",
            "facilities": ["Café & Angkringan"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_16",
            "name": "Wisata Omahe Jagung",
            "kecamatan": "Batanghari Nuban",
            "address": "Desa Gedong Dalem, Kecamatan Batanghari Nuban",
            "facilities": ["Foto Booth", "Kantin", "Kios Kuliner & Souvenir", "Gazebo", "Rest Area"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_17",
            "name": "Taman Wisata Bunga dan Edukasi Lembah Pawiki",
            "kecamatan": "Marga Tiga",
            "address": "Kecamatan Marga Tiga",
            "facilities": ["Taman Bunga", "Kandang Hewan", "Live Musik", "Toilet", "Aula", "Spot Selfie"],
            "contact": "",
            "map_link": "",
            "active": False
        },
        {
            "id": "built_18",
            "name": "Kolam Renang Pitaloka 2",
            "kecamatan": "Pekalongan",
            "address": "Desa Ganti Mulyo, Kecamatan Pekalongan",
            "facilities": ["Water Boom", "Kolam Renang Anak & Dewasa", "Toilet & Kamar Bilas", "Kantin", "Toko Souvenir", "Spot Selfie", "Mushola", "Aula Pertemuan"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/aL7Nfm4bmfotDE4z6",
            "active": True
        },
        {
            "id": "built_19",
            "name": "Tirta Lawang Sewu",
            "kecamatan": "Bandar Sribhawono",
            "address": "Desa Srigading, Kecamatan Bandar Sribhawono",
            "facilities": ["Kolam Renang", "Gazebo", "Toilet"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/VgSv7ffUPLsDAJrL7",
            "active": True
        },
        {
            "id": "built_20",
            "name": "Taman Kreasi Sriwijaya",
            "kecamatan": "Bandar Sribhawono",
            "address": "Desa Sadar Sriwijaya, Kecamatan Bandar Sribhawono",
            "facilities": ["Taman Bermain", "Spot Swafoto"],
            "contact": "",
            "map_link": "",
            "active": True
        },
        {
            "id": "built_21",
            "name": "Rest Area Labuhan Ratu VI",
            "kecamatan": "Labuhan Ratu",
            "address": "Desa Labuhan Ratu VI, Kecamatan Labuhan Ratu",
            "facilities": ["Area Parkir Luas", "Kios Kuliner", "Toilet", "Mushola"],
            "contact": "082183795269",
            "map_link": "https://maps.app.goo.gl/QCKr6aYSoVRC3d3c9",
            "active": True
        },
        {
            "id": "built_22",
            "name": "Way Guruh Sriwangi",
            "kecamatan": "Way Jepara",
            "address": "Kecamatan Way Jepara",
            "facilities": ["Kolam Pemandian", "Gazebo", "Toilet"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/e8fXH85d7Q1uARzBA",
            "active": True
        },
        {
            "id": "built_23",
            "name": "Waterboom Tirta Kencana",
            "kecamatan": "Bandar Sribhawono",
            "address": "Kecamatan Bandar Sribhawono",
            "facilities": ["Wahana Air", "Kolam Renang", "Toilet", "Kantin"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/Ng93bUjisAcvhzKCA",
            "active": True
        }
    ]

    # 3. WISATA BUDAYA
    wisata_budaya = [
        {
            "id": "culture_1",
            "name": "Taman Purbakala Pugung Raharjo",
            "kecamatan": "Sekampung Udik",
            "address": "Desa Pugung Raharjo, Kecamatan Sekampung Udik",
            "facilities": ["Rumah Informasi", "Museum Situs", "Peta Wisata", "Benda Sejarah", "Jalan Setapak", "Toilet", "Gazebo", "Kios Kuliner", "Area Parkir"],
            "contact": "081379108890",
            "map_link": "https://maps.app.goo.gl/KsZQJRZh9BWYJBzn9",
            "active": True
        },
        {
            "id": "culture_2",
            "name": "Museum Budaya Lampung Timur",
            "kecamatan": "Sukadana",
            "address": "Desa Sukadana Darat, Kecamatan Sukadana",
            "facilities": ["Koleksi Adat Lampung", "Ruang Pameran", "Pusat Studi Budaya"],
            "contact": "081278400123",
            "map_link": "https://maps.app.goo.gl/SAEGrywbHzHzJjoL8",
            "active": True
        },
        {
            "id": "culture_3",
            "name": "Desa Adat Tradisional Wana",
            "kecamatan": "Melinting",
            "address": "Desa Wana, Kecamatan Melinting",
            "facilities": ["Rumah Adat Kuno", "Kerajinan Tenun Lampung", "Sanggar Tari Melinting", "Homestay"],
            "contact": "085279695785",
            "map_link": "https://maps.app.goo.gl/vjWoqVST2ZHUz2HQA",
            "active": True
        },
        {
            "id": "culture_4",
            "name": "Gedung Sesat Agung",
            "kecamatan": "Sukadana",
            "address": "Desa Sukadana Darat, Kecamatan Sukadana",
            "facilities": ["Balai Pertemuan Adat"],
            "contact": "",
            "map_link": "https://maps.app.goo.gl/kqZcu2jHGzB9ruDC7",
            "active": False
        },
        {
            "id": "culture_5",
            "name": "Wisata Budaya Gemati",
            "kecamatan": "Batanghari",
            "address": "Desa Banjarejo, Kecamatan Batanghari",
            "facilities": ["Sanggar Seni", "Edukasi Budaya Jawa & Lampung"],
            "contact": "081279361155",
            "map_link": "https://maps.app.goo.gl/wD6FrRvt7Pm7Ttjo9",
            "active": True
        },
        {
            "id": "culture_6",
            "name": "Lawang Qori",
            "kecamatan": "Marga Tiga",
            "address": "Desa Gedong Wani, Kecamatan Marga Tiga",
            "facilities": ["Situs Peninggalan Sejarah", "Gerbang Adat Kuno"],
            "contact": "085273333379",
            "map_link": "https://maps.app.goo.gl/SHbRaxqzqiKSmYUU6",
            "active": True
        }
    ]

    return wisata_alam, wisata_buatan, wisata_budaya

def assign_coords(items, category):
    processed = []
    for item in items:
        kec = item.get("kecamatan", "Sukadana").strip()
        # Clean kecamatan string (e.g. "Labuhan Maringgai Gazebo..." to "Labuhan Maringgai")
        found_kec = None
        for k in KECAMATAN_COORDS.keys():
            if k.lower() in kec.lower():
                found_kec = k
                break
        
        if not found_kec:
            # Fallback
            found_kec = "Sukadana"
            
        base_lat, base_lng = KECAMATAN_COORDS[found_kec]
        
        # Add slight offset based on ID to make it deterministic but scattered
        # We can hash the ID or use its length
        h = hash(item["id"])
        lat_offset = ((h % 200) - 100) / 12000.0 # roughly -0.008 to 0.008 degrees
        lng_offset = (((h >> 2) % 200) - 100) / 12000.0
        
        item["lat"] = round(base_lat + lat_offset, 6)
        item["lng"] = round(base_lng + lng_offset, 6)
        item["kecamatan"] = found_kec
        item["category"] = category
        processed.append(item)
    return processed

def load_hotels():
    with open("parsed_data/compiled_tourism_data.json", "r") as f:
        original = json.load(f)
    
    hotels = original["hotels"]
    cleaned = []
    for h in hotels:
        # Check if address contains "Akomodasi Lainnya", classification
        # Clean name
        name = h["name"]
        if "Akomodasi Lainnya" in name:
            name = name.replace("Akomodasi Lainnya", "").strip()
            
        classification = h.get("classification", "Non Bintang")
        
        cleaned.append({
            "id": h["id"],
            "name": name,
            "classification": classification,
            "address": h["address"],
            "rooms": h.get("rooms", 10),
            "kecamatan": h.get("kecamatan", "Sukadana"),
            "category": "Akomodasi",
            "active": True
        })
    return cleaned

def load_restaurants():
    with open("parsed_data/compiled_tourism_data.json", "r") as f:
        original = json.load(f)
        
    restaurants = original["restaurants"]
    cleaned = []
    for r in restaurants:
        cleaned.append({
            "id": r["id"],
            "name": r["name"],
            "address": r["address"],
            "food_type": r.get("food_type", "Makanan Indonesia"),
            "capacity": r.get("capacity", 20),
            "kecamatan": r.get("kecamatan", "Sukadana"),
            "category": "Kuliner",
            "active": True
        })
    return cleaned

def main():
    w_alam, w_buatan, w_budaya = clean_wisata_manually()
    
    w_alam = assign_coords(w_alam, "Wisata Alam")
    w_buatan = assign_coords(w_buatan, "Wisata Buatan")
    w_budaya = assign_coords(w_budaya, "Wisata Budaya")
    
    hotels = load_hotels()
    hotels = assign_coords(hotels, "Akomodasi")
    
    restaurants = load_restaurants()
    restaurants = assign_coords(restaurants, "Kuliner")
    
    all_data = {
        "wisata_alam": w_alam,
        "wisata_buatan": w_buatan,
        "wisata_budaya": w_budaya,
        "hotels": hotels,
        "restaurants": restaurants
    }
    
    # Save directly to public and src
    import os
    os.makedirs("src/data", exist_ok=True)
    with open("src/data/tourism.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
        
    print("SUCCESS: Cleaned tourism data with coordinates created.")
    print(f"Total Wisata Alam: {len(w_alam)}")
    print(f"Total Wisata Buatan: {len(w_buatan)}")
    print(f"Total Wisata Budaya: {len(w_budaya)}")
    print(f"Total Hotels/Akomodasi: {len(hotels)}")
    print(f"Total Kuliner/Rumah Makan: {len(restaurants)}")

if __name__ == "__main__":
    main()
