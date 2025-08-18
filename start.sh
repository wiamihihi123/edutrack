#!/bin/bash

echo "========================================"
echo "           EduTrack - Demarrage"
echo "========================================"
echo

echo "Installation des dependances..."
npm run install-all

echo
echo "Demarrage de l'application..."
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo
echo "Compte par defaut:"
echo "Email: admin@edutrack.com"
echo "Mot de passe: admin123"
echo

npm run dev
