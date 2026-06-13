import os
import json
import re

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def parse_wisata(filepath, category):
    items = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split content by numbered items (e.g. "\n1 ", "\n2 ", "\n30 ")
    # We can match lines starting with numbers
    lines = content.split('\n')
    
    current_item = None
    
    # Simple state machine or regex parsing
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check if line starts with a number followed by space and name
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            if current_item:
                items.append(current_item)
            
            num = int(match.group(1))
            rest = match.group(2)
            
            # Default values
            current_item = {
                "id": f"{category}_{num}",
                "no": num,
                "name": rest,
                "address": "",
                "facilities": [],
                "contact": "",
                "map_link": "",
                "active": True,
                "category": category
            }
            
            # Check if name contains (NONAKTIF)
            if "(NONAKTIF)" in current_item["name"]:
                current_item["active"] = False
                current_item["name"] = current_item["name"].replace("(NONAKTIF)", "").strip()
            
            # Try to see if it's a short single line entry
            # Check if map link is in the rest
            link_match = re.search(r'(https://[^\s]+)', rest)
            if link_match:
                current_item["map_link"] = link_match.group(1)
                # Remove link from name for now, we will refine it
                current_item["name"] = current_item["name"].replace(current_item["map_link"], "").strip()
        
        elif current_item:
            # Check for facilities bullet points
            if line.startswith('•') or line.startswith('-') or line.startswith('*') or line.startswith('\u2022'):
                fac = line.lstrip('•-* ').strip()
                if fac:
                    current_item["facilities"].append(fac)
            # Check for map link
            elif 'https://maps.app.goo.gl/' in line or 'https://goo.gl/' in line:
                link_match = re.search(r'(https://[^\s]+)', line)
                if link_match:
                    current_item["map_link"] = link_match.group(1)
                    # Check if there is contact before it
                    parts = line.split(current_item["map_link"])
                    left = parts[0].strip()
                    if left:
                        # check if left is a contact number
                        if re.match(r'^\d[\d\s\-]+$', left):
                            current_item["contact"] = left
                        else:
                            # Might be part of address
                            if current_item["address"]:
                                current_item["address"] += " " + left
                            else:
                                current_item["address"] = left
            # Check for contact numbers
            elif re.match(r'^\d{8,15}$', line.replace(" ", "").replace("-", "")):
                current_item["contact"] = line
            else:
                # Add to address or name if address is empty
                # Let's clean the line
                # If there are items in address, append, otherwise set it
                # Check for "NONAKTIF" in middle of line
                if "(NONAKTIF)" in line:
                    current_item["active"] = False
                    line = line.replace("(NONAKTIF)", "").strip()
                
                # Check if it looks like contact + map link combined
                link_match = re.search(r'(https://[^\s]+)', line)
                if link_match:
                    current_item["map_link"] = link_match.group(1)
                    left = line.split(current_item["map_link"])[0].strip()
                    if left:
                        current_item["contact"] = left
                else:
                    if current_item["address"]:
                        current_item["address"] += " " + line
                    else:
                        current_item["address"] = line

    if current_item:
        items.append(current_item)
        
    # Clean up name, address, extract Kecamatan
    for item in items:
        # If name has too much text (e.g. address leaked in name), we can clean it
        # Try to extract Kecamatan from address or name
        kec_match = re.search(r'Kecamatan\s+([A-Za-z\s]+)', item["address"] + " " + item["name"], re.IGNORECASE)
        if kec_match:
            item["kecamatan"] = kec_match.group(1).strip()
            # Clean up kecamatan name (remove trailing spaces, commas)
            item["kecamatan"] = re.split(r'[,.\d•]', item["kecamatan"])[0].strip()
        else:
            item["kecamatan"] = "Sukadana" # Default capital
            
        # Clean up name and address
        item["name"] = clean_text(item["name"])
        item["address"] = clean_text(item["address"])
        
        # If address contains contact or map link, remove it
        if item["contact"] and item["contact"] in item["address"]:
            item["address"] = item["address"].replace(item["contact"], "").strip()
        if item["map_link"] and item["map_link"] in item["address"]:
            item["address"] = item["address"].replace(item["map_link"], "").strip()
            
    return items

def parse_hotels(filepath):
    items = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    current_item = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Look for numbers
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            if current_item:
                items.append(current_item)
            num = int(match.group(1))
            rest = match.group(2)
            
            current_item = {
                "id": f"hotel_{num}",
                "no": num,
                "name": rest,
                "classification": "Non Bintang",
                "address": "",
                "rooms": 10, # default
                "category": "Hotel"
            }
        elif current_item:
            # Parse classification, address, rooms
            # Bintang Satu, Non Bintang, Akomodasi Lainnya
            if "Non Bintang" in line:
                current_item["classification"] = "Non Bintang"
                line = line.replace("Non Bintang", "").strip()
            elif "Bintang Satu" in line:
                current_item["classification"] = "Bintang Satu"
                line = line.replace("Bintang Satu", "").strip()
            elif "Akomodasi Lainnya" in line:
                current_item["classification"] = "Akomodasi Lainnya"
                line = line.replace("Akomodasi Lainnya", "").strip()
                
            # Check if line is a number (rooms)
            if re.match(r'^\d+$', line):
                current_item["rooms"] = int(line)
            else:
                if current_item["address"]:
                    current_item["address"] += " " + line
                else:
                    current_item["address"] = line
                    
    if current_item:
        items.append(current_item)
        
    for item in items:
        item["name"] = clean_text(item["name"])
        item["address"] = clean_text(item["address"])
        # Extract kecamatan
        kec_match = re.search(r'Kecamatan\s+([A-Za-z\s]+)', item["address"] + " " + item["name"], re.IGNORECASE)
        if kec_match:
            item["kecamatan"] = re.split(r'[,.\d]', kec_match.group(1))[0].strip()
        else:
            # Fallback based on text
            if "Pasir Sakti" in item["address"] or "Pasir Sakti" in item["name"]:
                item["kecamatan"] = "Pasir Sakti"
            elif "Braja Harjosari" in item["address"] or "Braja Selebah" in item["address"]:
                item["kecamatan"] = "Braja Selebah"
            elif "Labuhan Ratu" in item["address"]:
                item["kecamatan"] = "Labuhan Ratu"
            elif "Sukadana" in item["address"]:
                item["kecamatan"] = "Sukadana"
            elif "Pekalongan" in item["address"]:
                item["kecamatan"] = "Pekalongan"
            elif "Mataram Baru" in item["address"]:
                item["kecamatan"] = "Mataram Baru"
            elif "Sribhawono" in item["address"] or "Bandar Sribhawono" in item["address"]:
                item["kecamatan"] = "Bandar Sribhawono"
            else:
                item["kecamatan"] = "Sukadana"
                
    return items

def parse_restaurants(filepath):
    items = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    lines = content.split('\n')
    current_item = None
    current_kecamatan = "Sukadana"
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line specifies a Kecamatan category, like "Kecamatan Sukadana :"
        kec_header = re.match(r'^Kecamatan\s+([A-Za-z\s]+)\s*:', line, re.IGNORECASE)
        if kec_header:
            current_kecamatan = kec_header.group(1).strip()
            continue
            
        # Look for numbers
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            if current_item:
                items.append(current_item)
            num = int(match.group(1))
            rest = match.group(2)
            
            current_item = {
                "id": f"culinary_{num}",
                "no": num,
                "name": rest,
                "address": "",
                "food_type": "Makanan Indonesia",
                "capacity": "20", # default seats
                "kecamatan": current_kecamatan,
                "category": "Kuliner"
            }
        elif current_item:
            # check if it says Makanan Indonesia
            if "Makanan Indonesia" in line:
                current_item["food_type"] = "Makanan Indonesia"
                # get capacity if exists
                cap = line.replace("Makanan Indonesia", "").strip()
                if cap:
                    current_item["capacity"] = cap
            elif re.match(r'^\d+$', line):
                current_item["capacity"] = line
            else:
                if current_item["address"]:
                    current_item["address"] += " " + line
                else:
                    current_item["address"] = line
                    
    if current_item:
        items.append(current_item)
        
    for item in items:
        item["name"] = clean_text(item["name"])
        item["address"] = clean_text(item["address"])
        # Clean capacity to integer if numeric
        cap_match = re.search(r'\d+', item["capacity"])
        item["capacity"] = int(cap_match.group(0)) if cap_match else 20
        
    return items

def main():
    wisata_alam = parse_wisata("parsed_data/wisata alam fix.txt", "Wisata Alam")
    wisata_buatan = parse_wisata("parsed_data/wisata buatan fix.txt", "Wisata Buatan")
    wisata_budaya = parse_wisata("parsed_data/wisata budaya fix.txt", "Wisata Budaya")
    hotels = parse_hotels("parsed_data/HOTEL.txt")
    restaurants = parse_restaurants("parsed_data/Rumah Makan.txt")
    
    # Save the files
    all_data = {
        "wisata_alam": wisata_alam,
        "wisata_buatan": wisata_buatan,
        "wisata_budaya": wisata_budaya,
        "hotels": hotels,
        "restaurants": restaurants
    }
    
    output_path = "parsed_data/compiled_tourism_data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
        
    print(f"Data compiled successfully into {output_path}!")
    print(f"Wisata Alam: {len(wisata_alam)} items")
    print(f"Wisata Buatan: {len(wisata_buatan)} items")
    print(f"Wisata Budaya: {len(wisata_budaya)} items")
    print(f"Hotels: {len(hotels)} items")
    print(f"Restaurants: {len(restaurants)} items")

if __name__ == "__main__":
    main()
