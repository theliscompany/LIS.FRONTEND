import { useReducer } from 'react';

// Hook personnalisé pour l'onboarding - version simplifiée
// TODO: Intégrer Onboard.js plus tard quand l'API sera stable

export type OnboardingType = 'wizard-step1' | 'wizard-step2' | 'wizard-step3' | 'wizard-step4' | 'wizard-step5' | 'wizard-step6' | 'wizard-step7' | 'dashboard' | 'features';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface OnboardingConfig {
  steps: OnboardingStep[];
  theme?: {
    primary?: string;
    secondary?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
}

// Configuration des étapes selon le type d'onboarding
const getWizardStep1Steps = (): OnboardingStep[] => [
  {
    id: 'wizard-step1-customer',
    title: 'Sélection du client',
    content: 'Commencez par sélectionner le client pour cette demande de transport. Utilisez la recherche pour trouver rapidement le bon client.',
    target: '#onboarding-customer-select',
    position: 'bottom'
  },
  {
    id: 'wizard-step1-departure',
    title: 'Ville de départ',
    content: 'Saisissez la ville et le pays de départ pour votre transport. Ces informations sont essentielles pour calculer les coûts.',
    target: '#onboarding-departure-city',
    position: 'bottom'
  },
  {
    id: 'wizard-step1-arrival',
    title: 'Ville d\'arrivée',
    content: 'Définissez la destination finale de votre transport. Assurez-vous que les informations sont précises.',
    target: '#onboarding-arrival-city',
    position: 'bottom'
  },
  {
    id: 'wizard-step1-product',
    title: 'Description du produit',
    content: 'Décrivez le produit à transporter. Cette information aide à déterminer le type de conteneur nécessaire.',
    target: '#onboarding-product',
    position: 'bottom'
  },
  {
    id: 'wizard-step1-assignee',
    title: 'Assignation',
    content: 'Choisissez qui sera responsable de cette demande. Cela permet de suivre et gérer efficacement le processus.',
    target: '#assigneeId',
    position: 'bottom'
  }
];

const getWizardStep2Steps = (): OnboardingStep[] => [
  {
    id: 'wizard-step2-header',
    title: 'Sélection des services',
    content: 'Bienvenue à l\'étape 2 ! Ici vous allez sélectionner les services de transport disponibles selon vos critères.',
    target: '#onboarding-step2-header',
    position: 'bottom'
  },
  {
    id: 'wizard-step2-demand-summary',
    title: 'Résumé de la demande',
    content: 'Vérifiez ici les détails de votre demande : client, trajet, produit et conditions. Ces informations déterminent les services proposés.',
    target: '#onboarding-step2-demand-summary',
    position: 'bottom'
  },
  {
    id: 'wizard-step2-services-list',
    title: 'Liste des services',
    content: 'Sélectionnez les services de transport qui correspondent à vos besoins. Chaque service affiche son taux d\'utilisation pour vous aider à choisir.',
    target: '#onboarding-step2-services-list',
    position: 'bottom'
  },
  {
    id: 'wizard-step2-selected-count',
    title: 'Compteur de sélection',
    content: 'Ce compteur vous montre combien de services vous avez sélectionnés. Vous devez en choisir au moins un pour continuer.',
    target: '#onboarding-step2-selected-count',
    position: 'bottom'
  },
  {
    id: 'wizard-step2-navigation',
    title: 'Navigation',
    content: 'Utilisez ces boutons pour naviguer : "Précédent" pour revenir à l\'étape 1, "Suivant" pour continuer vers l\'étape 3.',
    target: '#onboarding-step2-navigation',
    position: 'bottom'
  }
];

const getDashboardSteps = (): OnboardingStep[] => [
  {
    id: 'dashboard-overview',
    title: 'Tableau de bord',
    content: 'Bienvenue dans votre tableau de bord ! Ici vous pouvez voir un aperçu de toutes vos demandes de transport.',
    target: '#dashboard-overview',
    position: 'bottom'
  }
];

const getFeaturesSteps = (): OnboardingStep[] => [
  {
    id: 'features-menu',
    title: 'Menu principal',
    content: 'Explorez les différentes fonctionnalités disponibles dans le menu principal.',
    target: '#main-menu',
    position: 'bottom'
  }
];

export const useOnboarding = (onboardingType: OnboardingType) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  // Configuration selon le type d'onboarding
  const getSteps = (): OnboardingStep[] => {
    switch (onboardingType) {
      case 'wizard-step1':
        return getWizardStep1Steps();
      case 'wizard-step2':
        return getWizardStep2Steps();
      case 'dashboard':
        return getDashboardSteps();
      case 'features':
        return getFeaturesSteps();
      default:
        return [];
    }
  };

  // Version simplifiée pour le moment - nous utiliserons une implémentation basique
  const start = () => {
    console.log(`[Onboarding] Starting ${onboardingType} onboarding`);
    console.log(`[Onboarding] Steps:`, getSteps());
    localStorage.setItem(`${onboardingType}-onboarding-started`, 'true');
  };

  const stop = () => {
    console.log(`[Onboarding] Stopping ${onboardingType} onboarding`);
    localStorage.removeItem(`${onboardingType}-onboarding-started`);
    forceUpdate();
  };

  const isActive = (): boolean => {
    return localStorage.getItem(`${onboardingType}-onboarding-started`) === 'true';
  };

  // Fonction pour vérifier si l'onboarding a été vu
  const hasBeenSeen = (): boolean => {
    return localStorage.getItem(`${onboardingType}-onboarding-completed`) === 'true';
  };

  // Fonction pour marquer l'onboarding comme terminé
  const markAsCompleted = () => {
    console.log(`[Onboarding] ${onboardingType} onboarding marked as completed`);
    localStorage.setItem(`${onboardingType}-onboarding-completed`, 'true');
    localStorage.removeItem(`${onboardingType}-onboarding-started`);
    // Force l'arrêt immédiat
    stop();
    forceUpdate();
  };

  // Fonction pour marquer l'onboarding comme ignoré
  const markAsSkipped = () => {
    console.log(`[Onboarding] ${onboardingType} onboarding marked as skipped`);
    localStorage.setItem(`${onboardingType}-onboarding-skipped`, 'true');
    localStorage.removeItem(`${onboardingType}-onboarding-started`);
    // Force l'arrêt immédiat
    stop();
    forceUpdate();
  };

  // Fonction pour réinitialiser l'onboarding
  const reset = () => {
    localStorage.removeItem(`${onboardingType}-onboarding-completed`);
    localStorage.removeItem(`${onboardingType}-onboarding-skipped`);
    localStorage.removeItem(`${onboardingType}-onboarding-started`);
    console.log(`[Onboarding] ${onboardingType} onboarding reset`);
  };

  return {
    start,
    stop,
    isActive,
    hasBeenSeen,
    markAsCompleted,
    markAsSkipped,
    reset,
    steps: getSteps(),
    config: {
      theme: {
        primary: '#1976d2',
        secondary: '#dc004e',
        borderRadius: '8px',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
      }
    }
  };
}; 