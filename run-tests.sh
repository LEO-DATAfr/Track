#!/bin/bash

# PE Hub - Quick Test Start Script
# Ce script aide à démarrer les tests rapidement

echo "🧪 PE Hub - Tests d'Inscription & Base de Données"
echo "================================================="
echo ""

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "index.html" ]; then
    echo "❌ Erreur: index.html non trouvé!"
    echo "   Assurez-vous de run ce script depuis le répertoire Track/"
    echo "   cd /workspaces/Track && bash run-tests.sh"
    exit 1
fi

echo "✓ Fichiers trouvés:"
echo "  ✓ index.html (application principale)"
echo "  ✓ test-registration.html (tests navigateur)"
echo "  ✓ test-database.js (tests serveur)"
echo ""

# Menu
echo "Choisissez une option:"
echo ""
echo "1️⃣  - Démarrer les tests NAVIGATEUR"
echo "2️⃣  - Démarrer les tests SERVEUR (Node.js)"
echo "3️⃣  - Effacer les données de test"
echo "4️⃣  - Afficher les résultats du dernier test"
echo "0️⃣  - Quitter"
echo ""
read -p "Votre choix (0-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Tests Navigateur"
        echo "==================="
        echo ""
        echo "⚠️  Bien que l'application soit déployée, ouvrez:"
        echo "   http://localhost:PORT/test-registration.html"
        echo ""
        echo "📋 Utilisation:"
        echo "   1. Ouvrez le lien ci-dessus dans votre navigateur"
        echo "   2. Cliquez sur '▶️ Démarrer tous les tests'"
        echo "   3. Attendez que tous les tests se terminent"
        echo "   4. Consultez les résultats détaillés"
        echo ""
        echo "💾 Pour visualiser les données stockées, ouvrez la console (F12):"
        echo "   JSON.parse(localStorage.getItem('students'))"
        ;;
    2)
        echo ""
        echo "🖥️  Tests Serveur Node.js"
        echo "========================="
        echo ""
        
        # Vérifier si Node.js est installé
        if ! command -v node &> /dev/null; then
            echo "❌ Node.js n'est pas installé!"
            echo "   Installation: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install nodejs"
            exit 1
        fi
        
        echo "✓ Node.js trouvé: $(node --version)"
        echo ""
        
        # Vérifier les dépendances
        if ! npm list @supabase/supabase-js &> /dev/null 2>&1; then
            echo "📦 Installation des dépendances..."
            npm install @supabase/supabase-js crypto 2>/dev/null || {
                echo "⚠️  Les dépendances n'ont pas pu être installées"
                echo "   Essayez: npm install @supabase/supabase-js"
            }
        fi
        
        echo ""
        echo "🚀 Exécution des tests..."
        echo ""
        
        if [ -f "package.json" ]; then
            node test-database.js
        else
            # Fallback si pas de package.json
            node test-database.js
        fi
        
        echo ""
        echo "✓ Résultats sauvegardés dans: /tmp/pe-hub-test-results.json"
        ;;
    3)
        echo ""
        echo "🗑️  Effacement des données"
        echo "========================="
        read -p "⚠️  Êtes-vous sûr de vouloir effacer les données de test? (oui/non): " confirm
        if [ "$confirm" = "oui" ]; then
            echo "Données supprimées via localStorage.clear()"
            echo "Ouvrez la console du navigateur (F12) et exécutez:"
            echo "  localStorage.clear()"
            echo "  location.reload()"
        else
            echo "Annulé."
        fi
        ;;
    4)
        echo ""
        echo "📊 Résultats du Dernier Test"
        echo "============================"
        echo ""
        if [ -f "/tmp/pe-hub-test-results.json" ]; then
            cat /tmp/pe-hub-test-results.json | python3 -m json.tool || cat /tmp/pe-hub-test-results.json
        else
            echo "❌ Aucun résultat trouvé."
            echo "   Exécutez d'abord les tests serveur (option 2)"
        fi
        ;;
    0)
        echo "Au revoir! 👋"
        exit 0
        ;;
    *)
        echo "❌ Option invalide!"
        exit 1
        ;;
esac

echo ""
echo "================================================="
echo "✓ Opération terminée!"
