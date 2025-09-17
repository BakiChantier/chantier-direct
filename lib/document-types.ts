import { DocumentType } from '@prisma/client'

export interface DocumentConfig {
  type: DocumentType
  label: string
  required: boolean
  description?: string
}

export const DONNEUR_ORDRE_DOCUMENTS: DocumentConfig[] = [
  {
    type: 'KBIS',
    label: 'Extrait Kbis',
    required: true,
    description: 'Extrait Kbis de moins de 3 mois'
  },
  {
    type: 'ATTESTATION_ASSURANCE_RC_PRO',
    label: 'Attestation d\'Assurance RC Pro',
    required: true,
    description: 'Attestation d\'assurance responsabilité civile professionnelle en cours de validité'
  }
]

export const SOUS_TRAITANT_DOCUMENTS: DocumentConfig[] = [
  {
    type: 'KBIS',
    label: 'Extrait Kbis',
    required: true,
    description: 'Extrait Kbis de moins de 3 mois'
  },
  {
    type: 'ATTESTATION_VIGILANCE',
    label: 'Attestation de Vigilance',
    required: true,
    description: 'Attestation de vigilance de moins de 6 mois'
  },
  {
    type: 'ATTESTATION_ASSURANCE_RC_PRO',
    label: 'Attestation d\'Assurance RC Pro',
    required: true,
    description: 'Attestation d\'assurance responsabilité civile professionnelle en cours de validité'
  },
  {
    type: 'ATTESTATION_ASSURANCE_DECENNALE',
    label: 'Attestation d\'Assurance Décennale',
    required: true,
    description: 'Attestation d\'assurance décennale en cours de validité'
  },
  {
    type: 'IBAN',
    label: 'IBAN (RIB)',
    required: true,
    description: 'Relevé d\'identité bancaire (RIB) ou IBAN'
  },
  {
    type: 'LISTE_SALARIES_ETRANGERS',
    label: 'Liste Nominative des Salariés Étrangers',
    required: false,
    description: 'Liste nominative des salariés étrangers soumis à autorisation de travail (optionnel)'
  }
]

export function getDocumentsForUserRole(role: 'DONNEUR_ORDRE' | 'SOUS_TRAITANT'): DocumentConfig[] {
  switch (role) {
    case 'DONNEUR_ORDRE':
      return DONNEUR_ORDRE_DOCUMENTS
    case 'SOUS_TRAITANT':
      return SOUS_TRAITANT_DOCUMENTS
    default:
      return []
  }
}

export function getDocumentLabel(type: DocumentType): string {
  const allDocs = [...DONNEUR_ORDRE_DOCUMENTS, ...SOUS_TRAITANT_DOCUMENTS]
  const doc = allDocs.find(d => d.type === type)
  return doc?.label || type
} 