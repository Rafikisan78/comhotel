#!/bin/bash

# Script pour configurer Supabase en local

echo "🚀 Configuration de Supabase local..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "📦 Installation avec npm..."
    npm install -g supabase
fi

# Démarrer Supabase
echo "▶️  Démarrage de Supabase..."
supabase start

# Appliquer les migrations
echo "🔄 Application des migrations..."
supabase db reset

echo "✅ Supabase local configuré avec succès!"
echo "📊 Studio: http://localhost:54323"
echo "🔌 API: http://localhost:54321"
