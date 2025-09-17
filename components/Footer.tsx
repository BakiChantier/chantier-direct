import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section principale */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Chantier Direct</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              La plateforme de référence pour la mise en relation entre donneurs d&apos;ordre et sous-traitants dans le secteur du BTP.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center lg:text-start">Liens rapides</h3>
            <ul className="space-y-3 flex flex-col items-center lg:items-start">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/projets" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Appels d&apos;offre
                </Link>
              </li>
              <li>
                <Link href="/annuaire" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Annuaire sous-traitants
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Comment ça marche
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center lg:text-start">Contact</h3>
            <div className="space-y-3 flex flex-col items-center lg:items-start">
              <div className="flex flex-col items-center lg:items-start lg:flex-row space-x-3 text-sm text-gray-300">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-center lg:text-start">123 rue de la Construction<br />75001 Paris, France</span>
              </div>
              <div className="flex flex-col items-center lg:items-start lg:flex-row space-x-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex flex-col items-center lg:items-start lg:flex-row space-x-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <Link href="mailto:contact@chantier-direct.fr" className="hover:text-white transition-colors">
                  contact@chantier-direct.fr
                </Link>
              </div>
            </div>
          
          </div>
        </div>

        {/* Section légale */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
              <Link href="/legal/legal-mentions" className="hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Conditions d&apos;utilisation
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors">
                Politique des cookies
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Chantier Direct. Tous droits réservés.
            </div>
          </div>
        </div>

        {/* Informations réglementaires */}
        <div className="border-t border-gray-800 py-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Chantier Direct - SARL au capital de 50 000€ - RCS Paris 123 456 789
            </p>
            <p className="text-xs text-gray-500">
              Siège social : 123 rue de la Construction, 75001 Paris - TVA : FR12345678901
            </p>
            <p className="text-xs text-gray-500">
              Plateforme de mise en relation - N° d&apos;agrément : AGR-2024-001
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 