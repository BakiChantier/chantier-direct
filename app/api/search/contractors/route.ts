import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const minRatingParam = searchParams.get('minRating')
    const minProjectsParam = searchParams.get('minProjects')
    const expertisesParam = searchParams.get('expertises') // comma-separated enums
    const minRating = minRatingParam ? parseFloat(minRatingParam) : undefined
    const minProjects = minProjectsParam ? parseInt(minProjectsParam) : undefined
    const filterExpertises = expertisesParam ? expertisesParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean) : []
    if (!q || q.length < 2) {
      // Retourner une liste par défaut des sous-traitants les plus récents
      const users = await prisma.user.findMany({
        where: {
          role: 'SOUS_TRAITANT',
          isActive: true,
          ...(minRating !== undefined ? { noteGlobale: { gte: minRating } } : {}),
          ...(minProjects !== undefined ? { nombreEvaluations: { gte: minProjects } } : {}),
          ...(filterExpertises.length ? { expertises: { hasSome: filterExpertises as any } } : {}), // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          nom: true,
          prenom: true,
          nomSociete: true,
          ville: true,
          noteGlobale: true,
          expertises: true,
          autresExpertises: true,
          nombreEvaluations: true,
        }
      })
      const results = users.map(u => ({
        id: u.id,
        type: 'contractor',
        title: u.nomSociete || `${u.prenom || ''} ${u.nom}`.trim(),
        company: u.nomSociete || undefined,
        location: u.ville,
        rating: u.noteGlobale || undefined,
        expertise: u.expertises as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        otherExpertise: (u as any).autresExpertises || [], // eslint-disable-line @typescript-eslint/no-explicit-any
        completedProjects: u.nombreEvaluations || 0,
      }))
      return NextResponse.json({ data: { results } })
    }

    // Normalisation et mapping des métiers vers nos expertises enum
    const normalize = (s: string) => s
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '') // enlever accents
    const qNorm = normalize(q)
    const expertiseSynonyms: Record<string, string> = {
      plombier: 'PLOMBERIE', plomberie: 'PLOMBERIE', plombiers: 'PLOMBERIE',
      electricien: 'ELECTRICITE', electricite: 'ELECTRICITE', eclairage: 'ELECTRICITE',
      macon: 'MACONNERIE', maconnerie: 'MACONNERIE',
      plaquiste: 'PLAQUISTE', placo: 'PLAQUISTE',
      carreleur: 'CARRELAGE', carrelage: 'CARRELAGE',
      climatisation: 'CLIMATISATION', climatiseur: 'CLIMATISATION', frigoriste: 'CLIMATISATION', climaticien: 'CLIMATISATION',
      peintre: 'PEINTURE', peinture: 'PEINTURE',
      couvreur: 'COUVERTURE', couverture: 'COUVERTURE', toiture: 'COUVERTURE',
      menuisier: 'MENUISERIE', menuiserie: 'MENUISERIE',
      terrassier: 'TERRASSEMENT', terrassement: 'TERRASSEMENT',
      autre: 'AUTRE'
    }
    const mappedExpertise = expertiseSynonyms[qNorm]
    // const qUpper = q.toUpperCase()
    const enumLabels = ['PLOMBERIE','ELECTRICITE','MACONNERIE','PLAQUISTE','CARRELAGE','CLIMATISATION','PEINTURE','COUVERTURE','MENUISERIE','TERRASSEMENT','AUTRE']
    const dynamicMatches = enumLabels.filter(e => e.toLowerCase().includes(qNorm))
    // Utiliser une requête Mongo regex insensible (aggregateRaw) pour sous-chaînes partout
    const filter: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
      role: 'SOUS_TRAITANT',
      isActive: true,
    }
    if (minRating !== undefined) filter.noteGlobale = { $gte: minRating }
    if (minProjects !== undefined) filter.nombreEvaluations = { $gte: minProjects }
    if (filterExpertises.length) filter.expertises = { $in: filterExpertises }

    const regex = { $regex: q, $options: 'i' }
    const orConds: any[] = [ // eslint-disable-line @typescript-eslint/no-explicit-any
      { nom: regex },
      { prenom: regex },
      { nomSociete: regex },
      { ville: regex },
      { expertises: { $elemMatch: { $regex: q, $options: 'i' } } },
      { autresExpertises: { $elemMatch: { $regex: q, $options: 'i' } } },
    ]
    if (mappedExpertise) orConds.push({ expertises: mappedExpertise })
    if (dynamicMatches.length) orConds.push({ expertises: { $in: dynamicMatches } })
    filter.$or = orConds

    const raw = await prisma.user.aggregateRaw({
      pipeline: [
        { $match: filter },
        { $sort: { updatedAt: -1 } },
        { $limit: 20 },
        { $project: { id: '$_id', nom: 1, prenom: 1, nomSociete: 1, ville: 1, noteGlobale: 1, expertises: 1, autresExpertises: 1, nombreEvaluations: 1 } },
      ],
    }) as unknown as any[] // eslint-disable-line @typescript-eslint/no-explicit-any
 
    let users = raw.map((u: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      id: u.id?.toString?.() || u.id,
      nom: u.nom,
      prenom: u.prenom,
      nomSociete: u.nomSociete,
      ville: u.ville,
      noteGlobale: u.noteGlobale,
      expertises: u.expertises,
      autresExpertises: u.autresExpertises || [],
      nombreEvaluations: u.nombreEvaluations,
    }))

    // Fallback: si rien trouvé (Mongo peut être strict selon collation), filtrer côté app
    if (!users.length) {
      const pool = await prisma.user.findMany({
        where: {
          role: 'SOUS_TRAITANT',
          isActive: true,
          ...(minRating !== undefined ? { noteGlobale: { gte: minRating } } : {}),
          ...(minProjects !== undefined ? { nombreEvaluations: { gte: minProjects } } : {}),
          ...(filterExpertises.length ? { expertises: { hasSome: filterExpertises as any } } : {}), // eslint-disable-line @typescript-eslint/no-explicit-any
        },
        orderBy: { updatedAt: 'desc' },
        take: 200,
        select: {
          id: true,
          nom: true,
          prenom: true,
          nomSociete: true,
          ville: true,
          noteGlobale: true,
          expertises: true,
          autresExpertises: true,
          nombreEvaluations: true,
        },
      })
      const includes = (val?: string | null) => (val ? normalize(val).includes(qNorm) : false)
      users = pool.filter(u =>
        includes(u.nom) || includes(u.prenom) || includes(u.nomSociete) || includes(u.ville) ||
        (u.expertises || []).some((e: any) => e.toString().toLowerCase().includes(qNorm) || (mappedExpertise && e === mappedExpertise) || dynamicMatches.includes(e)) || // eslint-disable-line @typescript-eslint/no-explicit-any
        ((u as any).autresExpertises || []).some((e: any) => e && (e.toString().toLowerCase().includes(qNorm))) // eslint-disable-line @typescript-eslint/no-explicit-any
      ).slice(0, 20)
    }

    const results = users.map(u => ({
      id: u.id,
      type: 'contractor',
      title: u.nomSociete || `${u.prenom || ''} ${u.nom}`.trim(),
      company: u.nomSociete || undefined,
      location: u.ville,
      rating: u.noteGlobale || undefined,
      expertise: u.expertises as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      completedProjects: u.nombreEvaluations || 0,
    }))

    return NextResponse.json({ data: { results } })
  } catch (e) {
    console.error('Erreur lors de la recherche de sous-traitants', e)
    return NextResponse.json({ data: { results: [] } }, { status: 200 })
  }
}


