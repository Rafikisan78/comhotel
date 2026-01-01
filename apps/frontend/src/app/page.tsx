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
          <div className="flex gap-4 justify-center">
            <a
              href="/search"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Rechercher un hôtel
            </a>
            <a
              href="/login"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
