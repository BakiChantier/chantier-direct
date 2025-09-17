'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import Image from 'next/image'
import { 
  NavigationMenu, 
  NavigationMenuList, 
  NavigationMenuItem, 
  NavigationMenuLink 
} from '@/components/ui/navigation-menu'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import { useUser } from '@/lib/user-context'

export default function Header() {
  const { user, isLoading } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Accueil',
      href: '/',
      current: pathname === '/'
    },
    {
      name: 'Appels d\'Offre',
      href: '/projets',
      current: pathname.startsWith('/projets')
    },
    {
      name: 'Annuaire',
      href: '/annuaire',
      current: pathname.startsWith('/annuaire')
    },
    {
      name: 'Documentation',
      href: '/documentation',
      current: pathname.startsWith('/documentation')
    }
  ]

  // Routes où le header ne doit pas apparaître (si besoin)
  // const hideHeaderRoutes = ['/login', '/register']
  // const shouldHideHeader = hideHeaderRoutes.some(route => pathname.startsWith(route))

  // if (shouldHideHeader) {
  //   return null
  // }

  return (
    <header className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Image src="/ChantierDirectIcon.png" alt="Chantier Direct" width={400} height={400} />
              </div>
              <span className="hidden sm:block text-xl font-bold text-gray-800">
                Chantier-Direct
              </span>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="lg:ml-6 space-x-2 lg:space-x-6">
                {navigation.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={`text-lg font-bold transition-colors px-2 py-1 rounded-md hover:bg-gray-100 hover:text-blue-600 ${
                          item.current 
                            ? 'text-blue-600' 
                            : 'text-gray-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Barre de recherche */}
          <div className="hidden lg:flex flex-1 justify-center px-4 lg:px-8">
            <SearchBar 
              userRole={user?.role || null} 
              className="w-full max-w-lg"
            />
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Recherche mobile */}
            <div className="lg:hidden flex-1 mx-2">
              <SearchBar 
                userRole={user?.role || null} 
                className="w-full"
              />
            </div>

            {/* Menu utilisateur ou boutons de connexion */}
            {isLoading ? (
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">S&apos;inscrire</Link>
                </Button>
              </div>
            )}

            {/* Menu mobile */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild >
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-4">
                  <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Logo mobile */}
                            <div className="flex items-center space-x-2">
                              <div className="h-5 w-5 bg-gradient-to-r from-blue-600 to-green-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-xs">CD</span>
                              </div>
                              <span className="text-xl font-bold text-gray-800">
                                Chantier-Direct
                              </span>
                            </div>

                    {/* Navigation mobile */}
                    <nav className="space-y-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                            item.current
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>

                    {/* Boutons connexion mobile */}
                    {!user && (
                      <div className="space-y-3 pt-6 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          asChild
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link href="/login">Se connecter</Link>
                        </Button>
                        <Button 
                          className="w-full" 
                          asChild
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link href="/register">S&apos;inscrire</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 