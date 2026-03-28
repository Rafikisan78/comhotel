export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bienvenue sur Comhotel
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre plateforme de réservation d'hôtels intelligente
          </p>
          <a
            href="/hotels"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
          >
            Découvrir nos hôtels
          </a>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">45 Hôtels</h3>
            <p className="text-gray-600">
              Dans 6 villes à travers le monde
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Qualité Garantie</h3>
            <p className="text-gray-600">
              Des hôtels de 2 à 5 étoiles sélectionnés
            </p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Réservation Sécurisée</h3>
            <p className="text-gray-600">
              Paiement et données protégés
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
