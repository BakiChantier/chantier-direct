'use client'

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Shield, Zap, Users, CheckCircle, Building2, Search, Clock, MessageSquare, FileCheck, Globe, UserCheck, Send } from 'lucide-react';
import Link from 'next/link';
import { FaFileContract, FaBuilding } from 'react-icons/fa';
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';

export default function ChantierDirectHomepage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [latestProjects, setLatestProjects] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { user } = useUser();
  const router = useRouter();

  const handleProjectClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/register');
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
    animatedElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/projets');
        if (!res.ok) return;
        const data = await res.json();
        const projets = Array.isArray(data?.projets) ? data.projets : [];
        setLatestProjects(projets.slice(0, 2));
      } catch (e) {
        console.error('Erreur lors de la récupération des projets:', e);
      }
    };
    fetchLatest();
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Professionnels vérifiés",
      description: "KBIS, assurances et qualifications contrôlées"
    },
    {
      icon: Zap,
      title: "Matching intelligent",
      description: "Trouvez le partenaire idéal en quelques clics"
    },
    {
      icon: Users,
      title: "Communauté de confiance",
      description: "Avis clients et système de notation transparent"
    }
  ];

  const sousTraitantDocs = [
    "Attestation de Vigilance (6 Mois)",
    "Justificatif d'immatriculation", 
    "Attestation de Régularité Fiscale",
    "Attestation d'assurance RC Pro",
    "Attestation d'assurance Décennale",
    "International Bank Account Number (IBAN)",
    "Liste Nominative des salariés étrangers soumis à autorisation de travail"
  ];

  const donneurOrdreDocs = [
    "Extrait de KBIS",
    "Attestation d'assurance RC Pro"
  ];

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        .fade-in-on-scroll {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-fade-in-up {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-grid-slate-100 bg-[size:20px_20px] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-center lg:text-left fade-in-on-scroll min-w-0">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 max-w-full">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Plateforme BTP de confiance</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-tight mb-6 break-words">
                Connectez-vous aux 
                <span className="text-blue-600 block">meilleurs pros du BTP</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                La plateforme qui simplifie la mise en relation entre donneurs d&apos;ordre et sous-traitants qualifiés. 
                <span className="font-semibold text-slate-700">Travaillez avec les pros du BTP.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
                <Link href="/annuaire" className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl min-w-0 flex-shrink">
                  <span className="truncate">Je cherche des sous-traitants</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Link>
                <Link href="/projets" className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-blue-300 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 min-w-0 flex-shrink">
                  <span className="truncate">Je cherche des chantiers</span>
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Link>
              </div>
              
              {/* Stats */}
            {/*   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{stat.number}</div>
                    <div className="text-xs sm:text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div> */}
            </div>
            
            {/* Right Column - Visual */}
            <div className="relative fade-in-on-scroll min-w-0">
              <div className="bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 overflow-hidden">
                {/* Mock Interface */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-600">Projets disponibles</div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">+12 nouveaux</div>
                  </div>
                  
                  <div className="space-y-3">
                    {latestProjects.length === 0 ? (
                      <div className="text-sm text-slate-500">Aucun projet récent.</div>
                    ) : (
                      latestProjects.map((p) => (
                        <Link 
                          key={p.id} 
                          href={user ? `/projets/${p.id}` : '#'} 
                          className="block relative"
                          onClick={(e) => handleProjectClick(e)}
                        >
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2 min-w-0">
                              <div className={`font-semibold text-slate-900 truncate flex-1 mr-2 text-sm sm:text-base ${!user ? 'blur-sm select-none' : ''}`}>
                                {p.titre || 'Projet'}
                              </div>
                              {p.budgetMax ? (
                                <div className="text-xs sm:text-sm font-medium text-blue-600 flex-shrink-0">{p.budgetMax}€</div>
                              ) : null}
                            </div>
                            <div className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3 truncate">
                              {(p.villeChantier || 'Ville inconnue')}{p.typeChantier ? ` • ${p.typeChantier}` : ''}
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                              <span className={`text-xs sm:text-sm text-slate-600 truncate ${!user ? 'blur-sm select-none' : ''}`}>
                                Publié le {new Date(p.createdAt).toLocaleDateString()}
                                {p.donneurOrdre && (
                                  <span className="ml-2">• Par {p.donneurOrdre.nomSociete || `${p.donneurOrdre.prenom} ${p.donneurOrdre.nom}`}</span>
                                )}
                              </span>
                            </div>
                            {!user && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-slate-900 mb-1">🔒 Connectez-vous</div>
                                  <div className="text-xs text-slate-600">pour voir les détails</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                    <Link href="/projets" className="block">
                      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200 hover:bg-blue-100 transition-colors">
                        <div className="text-center text-blue-700 font-medium text-sm sm:text-base">
                          Voir tous les projets →
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-2 right-2 sm:-top-4 sm:-right-4 bg-green-500 text-white p-2 sm:p-3 rounded-xl shadow-lg float-animation">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="absolute bottom-2 left-2 sm:-bottom-4 sm:-left-4 bg-blue-600 text-white p-2 sm:p-3 rounded-xl shadow-lg float-animation" style={{animationDelay: '1s'}}>
                <Shield className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Quick Action Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center fade-in-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Postez un projet, recevez des offres 
              <span className="block text-yellow-300">à des prix compétitifs</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Notre algorithme de matching connecte instantanément votre projet aux sous-traitants disponibles dans votre zone
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center fade-in-on-scroll">
            {/* Left - Visual Timeline */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      0&apos;
                    </div>
                    <div>
                      <div className="font-semibold">Projet publié</div>
                      <div className="text-blue-100 text-sm">Votre annonce est en ligne</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-400 text-orange-900 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      2&apos;
                    </div>
                    <div>
                      <div className="font-semibold">Matching en cours</div>
                      <div className="text-blue-100 text-sm">Algorithme de sélection actif</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-green-400 text-green-900 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      10&apos;
                    </div>
                    <div>
                      <div className="font-semibold">Proposition de Profils</div>
                      <div className="text-blue-100 text-sm">Les pros vous contactent</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-200" />
                      <span className="font-medium">Messagerie intégrée</span>
                    </div>
                    <p className="text-sm text-blue-100 mt-2">
                      Échangez directement avec les professionnels via notre chat sécurisé
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Messaging Interface Mock */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-100 px-6 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Jean Dupont - Maçonnerie</div>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        En ligne
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="p-6 space-y-4 h-64 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      JD
                    </div>
                    <div className="bg-slate-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-slate-900">Bonjour ! J&apos;ai vu votre projet de rénovation. Je peux vous faire un devis sous 24h.</p>
                      <div className="text-xs text-slate-500 mt-1">Il y a 3 min</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Parfait ! Pouvez-vous passer sur site demain ?</p>
                      <div className="text-xs text-blue-200 mt-1">Il y a 1 min</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      JD
                    </div>
                    <div className="bg-slate-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-slate-900">Oui, je suis disponible entre 14h et 17h 👍</p>
                      <div className="text-xs text-slate-500 mt-1">À l&apos;instant</div>
                    </div>
                  </div>
                </div>
                
                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Tapez votre message..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      disabled
                    />
                    <button className="bg-blue-600 text-white p-2 rounded-lg">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pourquoi Chantier Direct ?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              La solution de confiance pour tous vos projets BTP
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group fade-in-on-scroll" style={{transitionDelay: `${index * 0.1}s`}}>
                <div className="bg-slate-50 group-hover:bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-200">
                  <feature.icon className="h-8 w-8 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FileCheck className="h-4 w-4" />
              Vérification administrative
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              100% des professionnels sont vérifiés
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Tous nos membres sont contrôlés par l&apos;administration avec des documents officiels pour garantir votre sécurité
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Sous-traitants */}
            <div className="bg-white rounded-2xl p-8 shadow-lg fade-in-on-scroll">
              <div className="text-center mb-8">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Sous-traitants</h3>
                <p className="text-slate-600">Documents obligatoires vérifiés</p>
              </div>
              
              <div className="space-y-4">
                {sousTraitantDocs.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-slate-800 text-sm font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Donneurs d'ordre */}
            <div className="bg-white rounded-2xl p-8 shadow-lg fade-in-on-scroll">
              <div className="text-center mb-8">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Donneurs d&apos;ordre</h3>
                <p className="text-slate-600">Documents obligatoires vérifiés</p>
              </div>
              
              <div className="space-y-4">
                {donneurOrdreDocs.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-800 text-sm font-medium">{doc}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
          
          <div className="text-center mt-12 fade-in-on-scroll">
            <div className="inline-flex items-center gap-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex flex-col lg:flex-row items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="font-semibold">Vérification sous 48h</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col lg:flex-row items-center gap-2 text-blue-600">
                <Shield className="h-6 w-6" />
                <span className="font-semibold">Sécurité garantie</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col lg:flex-row items-center gap-2 text-purple-600">
                <Globe className="h-6 w-6" />
                <span className="font-semibold">Conformité légale</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple. Rapide. Efficace.
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Donneurs d'ordre */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg fade-in-on-scroll">
              <div className="text-center mb-8">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Donneurs d&apos;ordre</h3>
                <p className="text-slate-600">Trouvez vos sous-traitants idéaux</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: "1", title: "Publiez votre projet", desc: "Décrivez votre chantier en 2 minutes publiez vos plans, vos exigences, ainsi que vos budgets et délais" },
                  { step: "2", title: "Recevez des offres", desc: "Les pros qualifiés vous contactent" },
                  { step: "3", title: "Choisissez", desc: "Comparez et sélectionnez le meilleur" }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-center">
                  <Link href="/register/donneur-ordre" className="flex items-start gap-3">
                    <FaBuilding className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex items-center gap-2">
                      S&apos;inscrire comme donneur d&apos;ordre
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Sous-traitants */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-lg fade-in-on-scroll">
              <div className="text-center mb-8">
                <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Sous-traitants</h3>
                <p className="text-slate-600">Développez votre activité</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: "1", title: "Créez votre profil", desc: "Mettez en avant vos compétences, vos référence de chantier et vos tarifs" },
                  { step: "2", title: "Trouvez des projets", desc: "Accédez aux chantiers près de chez vous grâce à nos recommandations ou via la recherche" },
                  { step: "3", title: "Décrochez votre première mission", desc: "Proposez vos services et décrochez des contrats" }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-center">
                  <Link href="/register/sous-traitant" className="flex items-start gap-3">
                    <FaFileContract className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex items-center gap-2">
                      S&apos;inscrire comme sous-traitant
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Rejoignez la communauté Chantier Direct
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Des milliers de professionnels nous font déjà confiance pour leurs projets BTP
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2">
              Commencer gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/projets" className="bg-transparent hover:bg-white/10 text-white border-2 border-white/20 hover:border-white/40 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200">
              Découvrir les projets
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-400 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Inscription gratuite
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Paiement sécurisé
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Support 24/7
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}