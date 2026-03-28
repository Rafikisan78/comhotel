/**
 * Script pour créer des chambres pour chaque hôtel
 * Usage: ts-node src/scripts/seed-rooms.ts
 */

const API_URL = "http://localhost:3000";

interface Hotel {
  id: string;
  name: string;
  star_rating: number;
  city: string;
}

interface RoomTemplate {
  room_number: string;
  room_type: string;
  description: string;
  base_price: number;
  capacity_adults: number;
  capacity_children?: number;
  capacity_infants?: number;
  amenities: string[];
  view_type?: string;
  surface_m2?: number;
}

// Templates de chambres selon le standing de l'hôtel
const getRoomTemplates = (
  starRating: number,
  hotelName: string,
): RoomTemplate[] => {
  const isPalace =
    hotelName.toLowerCase().includes("palace") ||
    hotelName.toLowerCase().includes("bristol") ||
    hotelName.toLowerCase().includes("ritz") ||
    hotelName.toLowerCase().includes("plaza") ||
    hotelName.toLowerCase().includes("meurice") ||
    starRating >= 5;

  if (isPalace) {
    // Hôtels de luxe / Palaces (5 étoiles et +)
    return [
      {
        room_number: "101",
        room_type: "deluxe",
        description:
          "Chambre Deluxe avec vue sur la ville, lit king size et salle de bain en marbre",
        base_price: 450,
        capacity_adults: 2,
        capacity_children: 1,
        amenities: [
          "WiFi gratuit",
          "TV 4K",
          "Climatisation",
          "Minibar premium",
          "Coffre-fort",
          "Peignoirs",
          "Nespresso",
        ],
        view_type: "city",
        surface_m2: 35,
      },
      {
        room_number: "102",
        room_type: "deluxe",
        description: "Chambre Deluxe avec vue jardin, décoration élégante",
        base_price: 480,
        capacity_adults: 2,
        capacity_children: 1,
        amenities: [
          "WiFi gratuit",
          "TV 4K",
          "Climatisation",
          "Minibar premium",
          "Coffre-fort",
          "Peignoirs",
          "Nespresso",
        ],
        view_type: "garden",
        surface_m2: 38,
      },
      {
        room_number: "201",
        room_type: "suite",
        description: "Suite Junior avec salon séparé et vue panoramique",
        base_price: 750,
        capacity_adults: 2,
        capacity_children: 2,
        capacity_infants: 1,
        amenities: [
          "WiFi gratuit",
          "TV 4K",
          "Climatisation",
          "Minibar premium",
          "Coffre-fort",
          "Peignoirs",
          "Nespresso",
          "Salon",
          "Bureau",
        ],
        view_type: "panoramic",
        surface_m2: 55,
      },
      {
        room_number: "202",
        room_type: "suite",
        description: "Suite Junior avec balcon privé",
        base_price: 780,
        capacity_adults: 2,
        capacity_children: 2,
        capacity_infants: 1,
        amenities: [
          "WiFi gratuit",
          "TV 4K",
          "Climatisation",
          "Minibar premium",
          "Coffre-fort",
          "Peignoirs",
          "Nespresso",
          "Salon",
          "Balcon",
        ],
        view_type: "city",
        surface_m2: 58,
      },
      {
        room_number: "301",
        room_type: "suite",
        description:
          "Suite Exécutive avec salon, salle à manger et vue exceptionnelle",
        base_price: 1200,
        capacity_adults: 3,
        capacity_children: 2,
        capacity_infants: 1,
        amenities: [
          "WiFi gratuit",
          "TV 4K",
          "Climatisation",
          "Minibar premium",
          "Coffre-fort",
          "Peignoirs",
          "Nespresso",
          "Salon",
          "Salle à manger",
          "Bureau",
          "Terrasse",
        ],
        view_type: "panoramic",
        surface_m2: 85,
      },
      {
        room_number: "401",
        room_type: "presidential",
        description:
          "Suite Présidentielle avec 2 chambres, salon, salle à manger et terrasse privée",
        base_price: 2500,
        capacity_adults: 4,
        capacity_children: 2,
        capacity_infants: 1,
        amenities: [
          "WiFi gratuit",
          "TV 4K",
          "Climatisation",
          "Minibar premium",
          "Coffre-fort",
          "Peignoirs",
          "Nespresso",
          "Salon",
          "Salle à manger",
          "Bureau",
          "Terrasse",
          "Jacuzzi",
          "Majordome",
        ],
        view_type: "panoramic",
        surface_m2: 150,
      },
    ];
  } else if (starRating === 4) {
    // Hôtels 4 étoiles
    return [
      {
        room_number: "101",
        room_type: "double",
        description: "Chambre Double Standard avec lit queen size",
        base_price: 120,
        capacity_adults: 2,
        amenities: [
          "WiFi gratuit",
          "TV",
          "Climatisation",
          "Minibar",
          "Coffre-fort",
        ],
        surface_m2: 25,
      },
      {
        room_number: "102",
        room_type: "double",
        description: "Chambre Double Confort avec vue",
        base_price: 140,
        capacity_adults: 2,
        capacity_children: 1,
        amenities: [
          "WiFi gratuit",
          "TV",
          "Climatisation",
          "Minibar",
          "Coffre-fort",
          "Balcon",
        ],
        view_type: "city",
        surface_m2: 28,
      },
      {
        room_number: "103",
        room_type: "twin",
        description: "Chambre Twin avec lits jumeaux",
        base_price: 130,
        capacity_adults: 2,
        amenities: [
          "WiFi gratuit",
          "TV",
          "Climatisation",
          "Minibar",
          "Coffre-fort",
        ],
        surface_m2: 26,
      },
      {
        room_number: "201",
        room_type: "family",
        description: "Chambre Familiale avec espace séparé pour enfants",
        base_price: 180,
        capacity_adults: 2,
        capacity_children: 2,
        amenities: [
          "WiFi gratuit",
          "TV",
          "Climatisation",
          "Minibar",
          "Coffre-fort",
          "Canapé-lit",
        ],
        surface_m2: 35,
      },
      {
        room_number: "301",
        room_type: "suite",
        description: "Suite Junior avec coin salon",
        base_price: 250,
        capacity_adults: 2,
        capacity_children: 1,
        amenities: [
          "WiFi gratuit",
          "TV",
          "Climatisation",
          "Minibar",
          "Coffre-fort",
          "Salon",
          "Peignoirs",
        ],
        surface_m2: 45,
      },
    ];
  } else {
    // Hôtels 3 étoiles et moins
    return [
      {
        room_number: "101",
        room_type: "single",
        description: "Chambre Simple avec lit simple",
        base_price: 60,
        capacity_adults: 1,
        amenities: ["WiFi gratuit", "TV", "Bureau"],
        surface_m2: 15,
      },
      {
        room_number: "102",
        room_type: "double",
        description: "Chambre Double Standard",
        base_price: 85,
        capacity_adults: 2,
        amenities: ["WiFi gratuit", "TV", "Climatisation"],
        surface_m2: 20,
      },
      {
        room_number: "103",
        room_type: "double",
        description: "Chambre Double avec balcon",
        base_price: 95,
        capacity_adults: 2,
        amenities: ["WiFi gratuit", "TV", "Climatisation", "Balcon"],
        surface_m2: 22,
      },
      {
        room_number: "201",
        room_type: "triple",
        description: "Chambre Triple pour 3 personnes",
        base_price: 110,
        capacity_adults: 3,
        capacity_children: 1,
        amenities: ["WiFi gratuit", "TV", "Climatisation"],
        surface_m2: 25,
      },
    ];
  }
};

async function createRoom(hotelId: string, roomData: RoomTemplate) {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotel_id: hotelId,
        ...roomData,
        is_active: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(
        `❌ Erreur création chambre ${roomData.room_number}:`,
        error,
      );
      return false;
    }

    await response.json();
    console.log(`✅ Chambre ${roomData.room_number} créée pour l'hôtel`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur création chambre ${roomData.room_number}:`, error);
    return false;
  }
}

async function seedRooms() {
  console.log("🏨 Démarrage du seed des chambres...\n");

  try {
    // Récupérer tous les hôtels
    const hotelsResponse = await fetch(`${API_URL}/hotels`);
    if (!hotelsResponse.ok) {
      throw new Error("Impossible de récupérer les hôtels");
    }

    const hotels: Hotel[] = await hotelsResponse.json();
    console.log(`📋 ${hotels.length} hôtels trouvés\n`);

    let totalCreated = 0;
    let totalFailed = 0;

    for (const hotel of hotels) {
      console.log(
        `\n🏨 Traitement: ${hotel.name} (${hotel.city}) - ${hotel.star_rating} étoiles`,
      );
      console.log(`   ID: ${hotel.id}`);

      // Vérifier si des chambres existent déjà
      const existingRoomsResponse = await fetch(`${API_URL}/rooms`);
      const allRooms = await existingRoomsResponse.json();
      const existingRooms = allRooms.filter(
        (r: any) => r.hotel_id === hotel.id,
      );

      if (existingRooms.length > 0) {
        console.log(
          `   ⚠️  ${existingRooms.length} chambres déjà existantes, skip...`,
        );
        continue;
      }

      // Générer les chambres selon le standing
      const roomTemplates = getRoomTemplates(hotel.star_rating, hotel.name);
      console.log(`   📝 ${roomTemplates.length} chambres à créer`);

      let hotelCreated = 0;
      for (const roomTemplate of roomTemplates) {
        const success = await createRoom(hotel.id, roomTemplate);
        if (success) {
          hotelCreated++;
          totalCreated++;
        } else {
          totalFailed++;
        }
        // Pause pour éviter de surcharger l'API
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`   ✨ ${hotelCreated} chambres créées avec succès`);
    }

    console.log("\n" + "=".repeat(60));
    console.log(`\n✅ Seed terminé!`);
    console.log(`   Total créé: ${totalCreated} chambres`);
    console.log(`   Total échoué: ${totalFailed} chambres`);
    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("\n❌ Erreur lors du seed:", error);
    process.exit(1);
  }
}

// Exécuter le seed
seedRooms()
  .then(() => {
    console.log("\n🎉 Script terminé avec succès!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erreur fatale:", error);
    process.exit(1);
  });
