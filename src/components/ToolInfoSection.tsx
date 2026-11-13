import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface ToolInfoSectionProps {
  toolId:
    | 'compress'
    | 'resize'
    | 'convert'
    | 'crop'
    | 'rotate-flip'
    | 'watermark'
    | 'image-to-pdf'
    | 'merge-pdf'
    | 'split-pdf'
    | 'rotate-pdf'
    | 'delete-pdf-pages'
    | 'pdf-to-jpg';
}

interface StepItem {
  title: string;
  desc: string;
}

interface ToolContent {
  h2Usage: string;
  steps: [StepItem, StepItem, StepItem];
  h2Privacy: string;
  privacyParagraph: string;
  h3Why: string;
  features: Array<{ title: string; desc: string }>;
}

const CONTENT: Record<string, Record<string, ToolContent>> = {
  fr: {
    compress: {
      h2Usage: 'Comment utiliser le compresseur d’images en ligne ?',
      steps: [
        {
          title: '1. Importez votre image',
          desc: 'Glissez-déposez ou sélectionnez votre fichier image (JPG, PNG, WebP) depuis votre appareil ou galerie photo.',
        },
        {
          title: '2. Ajustez la qualité souhaitée',
          desc: 'Utilisez le curseur interactif pour trouver l’équilibre parfait entre réduction du poids et conservation des détails visuels.',
        },
        {
          title: '3. Téléchargez instantanément',
          desc: 'Visualisez le résultat avant/après en temps réel et cliquez sur le bouton de téléchargement pour récupérer votre image allégée.',
        },
      ],
      h2Privacy: 'Traitement 100% local et confidentialité garantie',
      privacyParagraph:
        'Contrairement à la majorité des outils en ligne, notre technologie compresse vos images directement dans la mémoire vive de votre navigateur via des Web Workers dédiés. Vos images ne sont jamais téléchargées sur un serveur distant, garantissant une confidentialité totale pour vos documents personnels et professionnels.',
      h3Why: 'Pourquoi choisir notre compresseur ?',
      features: [
        { title: 'Zéro envoi sur serveur', desc: 'Vos données restent strictement sur votre appareil.' },
        { title: 'Vitesse instantanée', desc: 'Aucun temps d’attente lié à la vitesse de connexion internet.' },
        { title: 'Gratuit & sans filigrane', desc: 'Usage illimité sans aucun marquage forcé sur vos photos.' },
        { title: 'Qualité maîtrisée', desc: 'Algorithmes d’optimisation avancés pour préserver la netteté.' },
      ],
    },
    resize: {
      h2Usage: 'Comment redimensionner une image avec précision ?',
      steps: [
        {
          title: '1. Choisissez l’image à redimensionner',
          desc: 'Déposez votre photo dans la zone de travail ou cliquez pour parcourir vos dossiers.',
        },
        {
          title: '2. Définissez la taille cible',
          desc: 'Indiquez la largeur et la hauteur en pixels, ou utilisez les raccourcis d’échelle tout en conservant les proportions.',
        },
        {
          title: '3. Exportez l’image redimensionnée',
          desc: 'Le moteur Canvas recalcule chaque pixel localement pour un rendu net et prêt à l’emploi.',
        },
      ],
      h2Privacy: 'Redimensionnement 100% local et privé',
      privacyParagraph:
        'Le redimensionnement s’effectue grâce à l’API HTML5 Canvas directement exécutée par votre carte graphique et processeur. Aucun octet ne quitte votre machine, protégeant vos créations et clichés privés.',
      h3Why: 'Avantages du redimensionnement local',
      features: [
        { title: 'Précision au pixel près', desc: 'Contrôlez exactement les dimensions de vos images.' },
        { title: 'Ratio d’aspect verrouillable', desc: 'Évitez toute déformation accidentelle de vos photos.' },
        { title: 'Confidentialité totale', desc: 'Traitement en vase clos dans le navigateur.' },
        { title: 'Compatible tous supports', desc: 'Fonctionne parfaitement sur mobile, tablette et PC.' },
      ],
    },
    convert: {
      h2Usage: 'Comment convertir le format de vos images en ligne ?',
      steps: [
        {
          title: '1. Chargez votre image source',
          desc: 'Sélectionnez un fichier JPG, PNG ou WebP à convertir.',
        },
        {
          title: '2. Choisissez le format de sortie',
          desc: 'Basculez facilement vers JPG, PNG ou WebP selon vos besoins de compression ou de transparence.',
        },
        {
          title: '3. Enregistrez le nouveau fichier',
          desc: 'La conversion est effectuée en direct dans le navigateur sans latence réseau.',
        },
      ],
      h2Privacy: 'Conversion 100% locale sans intermédiaire',
      privacyParagraph:
        'Votre fichier n’est envoyé à aucun serveur tiers ou service cloud. La conversion de format est opérée localement en temps réel par les moteurs natifs de votre navigateur web.',
      h3Why: 'Pourquoi convertir avec ImageTools ?',
      features: [
        { title: 'Support de la transparence', desc: 'Conservez le canal alpha avec le format PNG.' },
        { title: 'Format WebP nouvelle génération', desc: 'Idéal pour accélérer le chargement des sites internet.' },
        { title: 'Traitement sécurisé', desc: 'Zéro risque de fuite de données confidentielles.' },
        { title: 'Sans inscription requise', desc: 'Accès libre, instantané et sans compte obligatoire.' },
      ],
    },
    crop: {
      h2Usage: 'Comment recadrer une image facilement ?',
      steps: [
        {
          title: '1. Importez votre cliché',
          desc: 'Déposez votre photo dans l’espace de recadrage interactif.',
        },
        {
          title: '2. Ajustez le cadre de sélection',
          desc: 'Déplacez et redimensionnez la zone de coupe librement ou fixez un ratio (1:1 carré, 16:9 ciné, etc.).',
        },
        {
          title: '3. Téléchargez la portion recadrée',
          desc: 'Validez votre sélection et enregistrez l’image découpée en haute définition.',
        },
      ],
      h2Privacy: 'Recadrage 100% privé et sécurisé',
      privacyParagraph:
        'Votre image reste confinée dans votre session de navigation. Le découpage s’opère sur une surface Canvas locale sans aucun stockage externe.',
      h3Why: 'Points forts du recadrage interactif',
      features: [
        { title: 'Ratios prédéfinis', desc: 'Carré pour réseaux sociaux, 16:9 pour bannières et vidéos.' },
        { title: 'Prise en main intuitive', desc: 'Guides visuels et poignées ergonomiques même sur écran tactile.' },
        { title: 'Traitement ultra-rapide', desc: 'Résultat prêt en une fraction de seconde.' },
        { title: 'Respect strict de la vie privée', desc: 'Aucune donnée collectée ni stockée.' },
      ],
    },
    'rotate-flip': {
      h2Usage: 'Comment faire pivoter ou retourner une image ?',
      steps: [
        {
          title: '1. Ajoutez votre photo',
          desc: 'Sélectionnez l’image nécessitant une correction d’orientation.',
        },
        {
          title: '2. Appliquez les rotations ou miroirs',
          desc: 'Tournez de 90° vers la gauche ou la droite, ou inversez horizontalement et verticalement en un clic.',
        },
        {
          title: '3. Téléchargez la version corrigée',
          desc: 'Récupérez instantanément votre photo correctement orientée.',
        },
      ],
      h2Privacy: 'Rotation locale sans altération de données',
      privacyParagraph:
        'Le réajustement d’angle est effectué directement sur le tampon graphique du navigateur. Aucune copie n’est transmise sur internet.',
      h3Why: 'Pourquoi pivoter vos images ici ?',
      features: [
        { title: 'Conservation des métadonnées', desc: 'Orientation propre sans perte de résolution.' },
        { title: 'Effet miroir instantané', desc: 'Idéal pour corriger les selfies pris en mode miroir.' },
        { title: 'Zéro serveur impliqué', desc: '100% exécuté sur votre machine.' },
        { title: 'Simplicité absolue', desc: 'Boutons directs à réponse immédiate.' },
      ],
    },
    watermark: {
      h2Usage: 'Comment ajouter un filigrane de protection sur vos images ?',
      steps: [
        {
          title: '1. Choisissez l’image à signer',
          desc: 'Importez votre photo ou infographie à protéger.',
        },
        {
          title: '2. Personnalisez votre filigrane',
          desc: 'Saisissez votre texte, ajustez la taille, l’opacité, la couleur et le positionnement (centre, coins).',
        },
        {
          title: '3. Exportez l’image protégée',
          desc: 'Téléchargez votre image marquée avec votre copyright personnel ou d’entreprise.',
        },
      ],
      h2Privacy: 'Protection copyright 100% confidentielle',
      privacyParagraph:
        'Vos œuvres d’art, photographies et documents confidentiels ne transitent jamais sur nos serveurs. L’incrustation du filigrane se fait en local dans votre navigateur.',
      h3Why: 'Pourquoi protéger vos images ?',
      features: [
        { title: 'Dissuasion contre le vol', desc: 'Protégez vos créations avant publication en ligne.' },
        { title: 'Personnalisation totale', desc: 'Contrôlez l’opacité pour un rendu élégant ou visible.' },
        { title: 'Sécurité de bout en bout', desc: 'Vos fichiers originaux ne sont jamais exposés.' },
        { title: 'Gratuit et illimité', desc: 'Signez autant d’images que nécessaire.' },
      ],
    },
    'image-to-pdf': {
      h2Usage: 'Comment convertir plusieurs images en document PDF ?',
      steps: [
        {
          title: '1. Sélectionnez vos photos',
          desc: 'Ajoutez une ou plusieurs images au format JPG, PNG ou WebP.',
        },
        {
          title: '2. Ajustez la mise en page',
          desc: 'Choisissez l’orientation de la page (Portrait ou Paysage) et la taille du papier.',
        },
        {
          title: '3. Générez le PDF complet',
          desc: 'Téléchargez votre fichier PDF assemblé en quelques secondes.',
        },
      ],
      h2Privacy: 'Assemblage PDF 100% local et sécurisé',
      privacyParagraph:
        'La génération du fichier PDF est assurée par un moteur vectoriel local exécuté dans votre navigateur. Vos reçus, factures ou photos d’identité restent entièrement confidentiels.',
      h3Why: 'Avantages de la conversion en PDF local',
      features: [
        { title: 'Idéal pour démarches officielles', desc: 'Rassemblez justificatifs et pièces d’identité en un PDF.' },
        { title: 'Format standard A4', desc: 'Mise en page propre et adaptée à l’impression.' },
        { title: 'Confidentialité absolue', desc: 'Traitement direct sans passerelle cloud.' },
        { title: 'Poids optimisé', desc: 'Compression intégrée pour des fichiers faciles à partager.' },
      ],
    },
    'merge-pdf': {
      h2Usage: 'Comment fusionner plusieurs fichiers PDF en un seul document ?',
      steps: [
        {
          title: '1. Déposez vos fichiers PDF',
          desc: 'Glissez-déposez plusieurs documents PDF dans l’ordre de votre choix.',
        },
        {
          title: '2. Réorganisez l’ordre des documents',
          desc: 'Utilisez les flèches monter/descendre pour ajuster précisément la séquence finale.',
        },
        {
          title: '3. Téléchargez le PDF consolidé',
          desc: 'Cliquez sur Fusionner pour obtenir un document unique prêt à être envoyé ou archivé.',
        },
      ],
      h2Privacy: 'Fusion de PDF 100% locale et privée',
      privacyParagraph:
        'Grâce à la bibliothèque pdf-lib exécutée dans le navigateur, vos documents sensibles (contrats, fiches de paie, relevés) sont assemblés localement. Aucune copie ne transite sur le réseau.',
      h3Why: 'Pourquoi fusionner vos PDF ici ?',
      features: [
        { title: 'Sécurité maximale', desc: 'Idéal pour documents juridiques et financiers.' },
        { title: 'Réorganisation flexible', desc: 'Contrôlez l’ordre d’apparition des pages.' },
        { title: 'Aucune limite artificielle', desc: 'Fusionnez autant de fichiers que nécessaire.' },
        { title: 'Rapide et sans pub intrusive', desc: 'Interface claire dédiée à la productivité.' },
      ],
    },
    'split-pdf': {
      h2Usage: 'Comment diviser ou extraire des pages d’un PDF ?',
      steps: [
        {
          title: '1. Importez votre document PDF',
          desc: 'Sélectionnez le fichier PDF multipages duquel vous souhaitez extraire des pages.',
        },
        {
          title: '2. Spécifiez les pages à conserver',
          desc: 'Entrez les numéros ou plages de pages séparés par des virgules (ex: 1-3, 5).',
        },
        {
          title: '3. Téléchargez le PDF allégé',
          desc: 'Obtenez immédiatement un nouveau document contenant uniquement les pages désirées.',
        },
      ],
      h2Privacy: 'Extraction 100% locale sans risque de fuite',
      privacyParagraph:
        'Le découpage et l’extraction des pages s’opèrent en mémoire vive dans votre navigateur. Le document original n’est jamais téléversé sur un serveur.',
      h3Why: 'Avantages de la division locale de PDF',
      features: [
        { title: 'Ciblage précis des pages', desc: 'Extrayez uniquement ce qui vous intéresse.' },
        { title: 'Allègement du fichier', desc: 'Réduisez le poids en supprimant les pages inutiles.' },
        { title: 'Protection de la vie privée', desc: 'Zéro trace laissée en ligne.' },
        { title: 'Fonctionne hors-connexion', desc: 'Traitement fluide et instantané.' },
      ],
    },
    'rotate-pdf': {
      h2Usage: 'Comment faire pivoter l’orientation de vos pages PDF ?',
      steps: [
        {
          title: '1. Chargez le fichier PDF',
          desc: 'Déposez votre document PDF scanné ou mal orienté.',
        },
        {
          title: '2. Choisissez l’angle de rotation',
          desc: 'Faites pivoter toutes les pages de 90° vers la droite ou vers la gauche en un clic.',
        },
        {
          title: '3. Enregistrez le PDF orienté',
          desc: 'Téléchargez votre document redressé sans altérer les textes ni les images vectorielles.',
        },
      ],
      h2Privacy: 'Rotation de PDF 100% locale et confidentielle',
      privacyParagraph:
        'La rotation met à jour les métadonnées géométriques internes du PDF directement sur votre appareil. Vos documents d’affaires restent strictement confidentiels.',
      h3Why: 'Pourquoi redresser vos PDF avec ImageTools ?',
      features: [
        { title: 'Correction instantanée des scans', desc: 'Idéal pour redresser des factures ou formulaires numérisés à l’envers.' },
        { title: 'Préservation de la netteté', desc: 'Aucune recompression destructive des pages.' },
        { title: 'Confidentialité totale', desc: 'Les fichiers restent cantonnés à votre navigateur.' },
        { title: 'Gratuit et illimité', desc: 'Redressez autant de documents que souhaité.' },
      ],
    },
    'delete-pdf-pages': {
      h2Usage: 'Comment supprimer des pages indésirables d’un PDF ?',
      steps: [
        {
          title: '1. Ouvrez votre document PDF',
          desc: 'Glissez-déposez le PDF dont vous souhaitez retirer des pages superflues.',
        },
        {
          title: '2. Indiquez les pages à supprimer',
          desc: 'Renseignez les numéros ou plages de pages à éliminer (ex: 2, 4-6).',
        },
        {
          title: '3. Téléchargez le PDF épuré',
          desc: 'Récupérez votre document nettoyé en quelques secondes.',
        },
      ],
      h2Privacy: 'Nettoyage 100% local et sécurisé',
      privacyParagraph:
        'L’effacement des pages s’effectue en direct par reconstruction de la table des objets PDF dans votre navigateur. Aucun envoi vers un serveur cloud.',
      h3Why: 'Avantages de la suppression de pages PDF',
      features: [
        { title: 'Élimination des pages blanches', desc: 'Nettoyez facilement les numérisations avec pages vides.' },
        { title: 'Protection des données sensibles', desc: 'Retirez les pages contenant des informations confidentielles.' },
        { title: 'Zéro serveur tiers', desc: 'Traitement entièrement autonome sur votre machine.' },
        { title: 'Simplicité et rapidité', desc: 'Opérationnelle immédiatement sans inscription.' },
      ],
    },
    'pdf-to-jpg': {
      h2Usage: 'Comment convertir un document PDF en images JPG ?',
      steps: [
        {
          title: '1. Déposez votre document PDF',
          desc: 'Sélectionnez le PDF multipages à transformer en images individuelles.',
        },
        {
          title: '2. Rendu haute résolution Canvas',
          desc: 'Le moteur PDF.js génère chaque page en image nette avec un niveau de détail optimal.',
        },
        {
          title: '3. Téléchargez vos images ou l’archive ZIP',
          desc: 'Téléchargez les pages une par une ou téléchargez toutes les images regroupées dans une archive ZIP.',
        },
      ],
      h2Privacy: 'Rendu PDF vers JPG 100% local et privé',
      privacyParagraph:
        'La conversion est exécutée grâce à PDF.js et des toiles HTML5 Canvas directement dans votre navigateur web. Aucun document n’est envoyé sur le cloud ou un serveur distant.',
      h3Why: 'Pourquoi convertir vos PDF en JPG ici ?',
      features: [
        { title: 'Rendu HD fidèle', desc: 'Conserve la netteté des polices de caractères et des graphismes.' },
        { title: 'Téléchargement ZIP en 1 clic', desc: 'Récupérez toutes les pages d’un coup dans une archive propre.' },
        { title: 'Confidentialité absolue', desc: 'Rien n’est enregistré sur internet.' },
        { title: 'Sans file d’attente', desc: 'Pas de bridage de bande passante serveur.' },
      ],
    },
  },
  en: {
    compress: {
      h2Usage: 'How to use the online image compressor?',
      steps: [
        { title: '1. Upload your image', desc: 'Drag & drop or select your JPG, PNG, or WebP image from your device.' },
        { title: '2. Adjust compression level', desc: 'Use the interactive slider to balance file size reduction and image clarity.' },
        { title: '3. Download instantly', desc: 'Preview before/after in real time and click download to get your optimized image.' },
      ],
      h2Privacy: '100% local processing & guaranteed privacy',
      privacyParagraph:
        'Unlike cloud-based services, our technology compresses images right inside your browser using dedicated Web Workers. Your files are never sent to any remote server, ensuring total confidentiality.',
      h3Why: 'Why choose our compressor?',
      features: [
        { title: 'Zero server uploads', desc: 'Your files stay strictly on your device.' },
        { title: 'Instant performance', desc: 'No network transfer delays or queues.' },
        { title: 'Free & watermark-free', desc: 'Unlimited usage with no forced branding.' },
        { title: 'Preserved quality', desc: 'Advanced algorithms to keep visual sharpness.' },
      ],
    },
    resize: {
      h2Usage: 'How to resize an image with pixel precision?',
      steps: [
        { title: '1. Select the image', desc: 'Drop your image into the workspace or click to browse files.' },
        { title: '2. Set target dimensions', desc: 'Enter width and height in pixels or use scale presets while maintaining aspect ratio.' },
        { title: '3. Export resized image', desc: 'HTML5 Canvas recalculates pixels locally for crisp, ready-to-use output.' },
      ],
      h2Privacy: '100% local and private resizing',
      privacyParagraph:
        'Resizing is powered by HTML5 Canvas executed by your GPU and CPU. Not a single byte leaves your computer or phone.',
      h3Why: 'Advantages of local resizing',
      features: [
        { title: 'Pixel-perfect control', desc: 'Specify exact dimensions easily.' },
        { title: 'Lock aspect ratio', desc: 'Prevent accidental image stretching or distortion.' },
        { title: 'Total confidentiality', desc: 'Client-side processing inside your browser sandbox.' },
        { title: 'Mobile & desktop friendly', desc: 'Optimized for touchscreens and desktop computers.' },
      ],
    },
    convert: {
      h2Usage: 'How to convert image formats online?',
      steps: [
        { title: '1. Load source image', desc: 'Select a JPG, PNG, or WebP file to convert.' },
        { title: '2. Choose output format', desc: 'Easily switch to JPG, PNG, or WebP based on transparency or compression needs.' },
        { title: '3. Save the converted file', desc: 'Conversion runs live in your browser without network latency.' },
      ],
      h2Privacy: '100% local conversion with zero servers',
      privacyParagraph:
        'Your file is never uploaded to any third-party cloud service. Format conversion is handled on your device by modern browser engines.',
      h3Why: 'Why convert with ImageTools?',
      features: [
        { title: 'Transparency support', desc: 'Preserve alpha transparency when converting to PNG.' },
        { title: 'Next-gen WebP', desc: 'Ideal for faster website loading speeds.' },
        { title: 'Secure & private', desc: 'No risk of private data exposure.' },
        { title: 'No registration needed', desc: 'Instant free access with no account required.' },
      ],
    },
    crop: {
      h2Usage: 'How to crop an image easily?',
      steps: [
        { title: '1. Import your photo', desc: 'Drop your image into the interactive crop editor.' },
        { title: '2. Adjust the crop box', desc: 'Move and scale freely or choose a preset ratio (1:1 square, 16:9 widescreen).' },
        { title: '3. Download cropped result', desc: 'Confirm your selection and save the high-resolution crop.' },
      ],
      h2Privacy: '100% private and secure cropping',
      privacyParagraph:
        'Your image stays confined to your active browser session. Cropping happens on a local Canvas with zero external storage.',
      h3Why: 'Interactive cropping benefits',
      features: [
        { title: 'Preset aspect ratios', desc: 'Square for social profiles, 16:9 for banners.' },
        { title: 'Intuitive controls', desc: 'Visual guidelines and touch-friendly handles.' },
        { title: 'Blazing fast', desc: 'Crop generated in a split second.' },
        { title: 'Strict privacy', desc: 'No telemetry or storage of your media.' },
      ],
    },
    'rotate-flip': {
      h2Usage: 'How to rotate or flip an image?',
      steps: [
        { title: '1. Add your photo', desc: 'Select the image requiring orientation correction.' },
        { title: '2. Apply rotation or mirror', desc: 'Rotate 90° clockwise/counter-clockwise, or flip horizontally/vertically.' },
        { title: '3. Download corrected version', desc: 'Instantly download your properly oriented photo.' },
      ],
      h2Privacy: 'Local rotation without quality loss',
      privacyParagraph:
        'Angle readjustment happens directly on the browser’s graphic buffer. No copy is transmitted over the internet.',
      h3Why: 'Why rotate your images here?',
      features: [
        { title: 'Preserved resolution', desc: 'Clean orientation without destructive resampling.' },
        { title: 'Mirror correction', desc: 'Fix mirrored selfie photos in one tap.' },
        { title: 'Zero servers involved', desc: '100% computed on your machine.' },
        { title: 'Instant one-click actions', desc: 'Fast, responsive controls.' },
      ],
    },
    watermark: {
      h2Usage: 'How to add a watermark to your photos?',
      steps: [
        { title: '1. Choose the image to protect', desc: 'Import the photo or graphic you wish to watermark.' },
        { title: '2. Customize your watermark', desc: 'Type your text, adjust size, opacity, color, and position.' },
        { title: '3. Export protected image', desc: 'Download your watermarked image ready to share safely online.' },
      ],
      h2Privacy: '100% confidential copyright protection',
      privacyParagraph:
        'Your artwork, photos, and documents are never exposed online. The watermark is rendered locally in your browser memory.',
      h3Why: 'Why protect your imagery?',
      features: [
        { title: 'Deter theft & misuse', desc: 'Protect your visual property before sharing.' },
        { title: 'Custom styling', desc: 'Subtle or prominent branding based on your needs.' },
        { title: 'Safe workflow', desc: 'Originals are never sent to external servers.' },
        { title: 'Free & unlimited', desc: 'Watermark as many images as you need.' },
      ],
    },
    'image-to-pdf': {
      h2Usage: 'How to convert multiple images into a PDF document?',
      steps: [
        { title: '1. Select your images', desc: 'Add one or more JPG, PNG, or WebP photos.' },
        { title: '2. Choose orientation & layout', desc: 'Select Portrait or Landscape layout and standard paper size.' },
        { title: '3. Generate complete PDF', desc: 'Download your compiled PDF file in seconds.' },
      ],
      h2Privacy: '100% local & secure PDF creation',
      privacyParagraph:
        'PDF generation is handled by a client-side vector engine. Receipts, invoices, and IDs remain completely private.',
      h3Why: 'Benefits of client-side Image to PDF',
      features: [
        { title: 'Standard A4 format', desc: 'Clean layout ready for printing or official submissions.' },
        { title: 'Multiple files consolidation', desc: 'Combine receipts and invoices into one document.' },
        { title: 'Total confidentiality', desc: 'Direct processing with no cloud storage.' },
        { title: 'Lightweight output', desc: 'Balanced compression for easy sharing via email.' },
      ],
    },
    'merge-pdf': {
      h2Usage: 'How to merge multiple PDF files into one document?',
      steps: [
        { title: '1. Drop your PDF files', desc: 'Drag and drop multiple PDF documents into the workspace.' },
        { title: '2. Reorder document sequence', desc: 'Use the up and down controls to arrange the exact page sequence.' },
        { title: '3. Download consolidated PDF', desc: 'Click Merge to generate a unified PDF document instantly.' },
      ],
      h2Privacy: '100% local and private PDF merging',
      privacyParagraph:
        'Powered by client-side pdf-lib in your browser, sensitive documents (contracts, financial reports) are merged locally. No copies travel across the internet.',
      h3Why: 'Why merge PDFs here?',
      features: [
        { title: 'Maximum security', desc: 'Ideal for sensitive legal and financial paperwork.' },
        { title: 'Flexible ordering', desc: 'Arrange documents in any custom order.' },
        { title: 'No arbitrary limits', desc: 'Merge as many files as your device supports.' },
        { title: 'Fast & ad-free workspace', desc: 'Distraction-free environment built for productivity.' },
      ],
    },
    'split-pdf': {
      h2Usage: 'How to split or extract pages from a PDF document?',
      steps: [
        { title: '1. Upload your PDF document', desc: 'Select the multi-page PDF you want to extract pages from.' },
        { title: '2. Specify page ranges', desc: 'Enter page numbers or ranges separated by commas (e.g. 1-3, 5).' },
        { title: '3. Download split PDF', desc: 'Instantly download a new PDF containing only your selected pages.' },
      ],
      h2Privacy: '100% local extraction with zero data leakage',
      privacyParagraph:
        'Page splitting and extraction are executed in browser RAM. Your original file is never uploaded to any remote server.',
      h3Why: 'Benefits of local PDF splitting',
      features: [
        { title: 'Precise extraction', desc: 'Extract only relevant sections or pages.' },
        { title: 'Reduce file size', desc: 'Discard unnecessary pages to lighten documents.' },
        { title: 'Strict privacy', desc: 'Zero trace left online.' },
        { title: 'Instant offline processing', desc: 'Reliable speed unaffected by network status.' },
      ],
    },
    'rotate-pdf': {
      h2Usage: 'How to rotate PDF page orientations?',
      steps: [
        { title: '1. Load your PDF file', desc: 'Drop your scanned or incorrectly oriented PDF document.' },
        { title: '2. Choose rotation angle', desc: 'Rotate all pages 90° clockwise or counter-clockwise in one click.' },
        { title: '3. Save rotated PDF', desc: 'Download your corrected document while preserving text and vector clarity.' },
      ],
      h2Privacy: '100% local and confidential PDF rotation',
      privacyParagraph:
        'Rotation updates internal page geometry directly on your device. Business documents remain strictly confidential.',
      h3Why: 'Why rotate PDFs with ImageTools?',
      features: [
        { title: 'Fix upside-down scans', desc: 'Perfect for inverted receipts and forms.' },
        { title: 'Zero quality degradation', desc: 'No lossy re-encoding of page elements.' },
        { title: 'Complete privacy', desc: 'Files remain inside your local browser sandbox.' },
        { title: 'Free & unlimited', desc: 'Reorient as many documents as needed.' },
      ],
    },
    'delete-pdf-pages': {
      h2Usage: 'How to delete unwanted pages from a PDF?',
      steps: [
        { title: '1. Open your PDF document', desc: 'Drop the PDF containing unnecessary pages.' },
        { title: '2. Enter pages to remove', desc: 'List page numbers or ranges to delete (e.g. 2, 4-6).' },
        { title: '3. Download cleaned PDF', desc: 'Get your streamlined document in seconds.' },
      ],
      h2Privacy: '100% local and secure page deletion',
      privacyParagraph:
        'Page deletion rebuilds the PDF object tree in real time within your browser. No files are uploaded to cloud servers.',
      h3Why: 'Benefits of PDF page deletion',
      features: [
        { title: 'Remove blank pages', desc: 'Clean up accidental blank scanner pages.' },
        { title: 'Redact sensitive pages', desc: 'Remove confidential sheets before sharing.' },
        { title: 'Zero third-party servers', desc: 'Autonomous processing on your device.' },
        { title: 'Simple and fast', desc: 'No signup or account registration.' },
      ],
    },
    'pdf-to-jpg': {
      h2Usage: 'How to convert PDF documents to JPG images?',
      steps: [
        { title: '1. Upload your PDF file', desc: 'Select the multi-page PDF you want to turn into photos.' },
        { title: '2. High-resolution rendering', desc: 'PDF.js renders every page into crisp, high-quality images.' },
        { title: '3. Download images or ZIP', desc: 'Save pages one by one or download all pages in a single ZIP archive.' },
      ],
      h2Privacy: '100% local & private PDF to JPG rendering',
      privacyParagraph:
        'Conversion is powered by PDF.js and HTML5 Canvas inside your browser. No documents are transmitted to cloud servers.',
      h3Why: 'Why convert PDFs to JPG here?',
      features: [
        { title: 'Crystal clear HD render', desc: 'Preserves sharp typography and vector graphics.' },
        { title: '1-Click ZIP bundle', desc: 'Download all extracted pages in an organized archive.' },
        { title: 'Absolute privacy', desc: 'Nothing is stored or logged online.' },
        { title: 'No wait times', desc: 'Fast client-side rendering without server queues.' },
      ],
    },
  },
  ar: {
    compress: {
      h2Usage: 'كيفية استخدام ضاغط الصور أونلاين؟',
      steps: [
        { title: '1. رفع الصورة', desc: 'اسحب وأفلت أو حدد صورة (JPG أو PNG أو WebP) من جهازك.' },
        { title: '2. ضبط مستوى الضغط', desc: 'استخدم شريط التمرير التفاعلي لموازنة تقليل الحجم مع الحفاظ على وضوح الصورة.' },
        { title: '3. التنزيل الفوري', desc: 'شاهد النتيجة قبل وبعد في الوقت الفعلي ثم حمّل صورتك المخففة.' },
      ],
      h2Privacy: 'معالجة محلية 100٪ وخصوصية مضمونة',
      privacyParagraph:
        'على عكس الخدمات السحابية، تعمل تقنيتنا على ضغط الصور مباشرة في ذاكرة متصفحك عبر عمال الويب المخصصين. لا تُرسل ملفاتك أبدًا إلى خوادم خارجية، مما يضمن أقصى خصوصية.',
      h3Why: 'لماذا تختار ضاغط الصور لدينا؟',
      features: [
        { title: 'بدون رفع إلى الخوادم', desc: 'تبقى ملفاتك بأمان على جهازك الشخصي.' },
        { title: 'سرعة فائقة وفورية', desc: 'بدون انتظار بطء سرعة رفع الملفات.' },
        { title: 'مجاني وبدون علامات مائية', desc: 'استخدام غير محدود وبدون علامات قسرية.' },
        { title: 'جودة فائقة ومحفوظة', desc: 'خوارزميات متطورة للحفاظ على دقة التفاصيل.' },
      ],
    },
    resize: {
      h2Usage: 'كيفية تغيير أبعاد الصورة بدقة؟',
      steps: [
        { title: '1. اختيار الصورة', desc: 'أفلت صورتك في مساحة العمل أو انقر للتصفح.' },
        { title: '2. تحديد الأبعاد المطلوبة', desc: 'أدخل العرض والارتفاع بالبكسل مع إمكانية قفل التناسب.' },
        { title: '3. تصدير الصورة المعدلة', desc: 'يقوم محرك Canvas بحساب البكسلات محلياً لإخراج نقي وجاهز.' },
      ],
      h2Privacy: 'تغيير حجم محلي وخاص 100٪',
      privacyParagraph:
        'تتم العملية باستخدام تقنية HTML5 Canvas محلياً على جهازك دون إرسال أي بايت عبر الإنترنت.',
      h3Why: 'مميزات تغيير الأبعاد المحلي',
      features: [
        { title: 'دقة بالبكسل', desc: 'تحكم كامل في مقاسات الصور.' },
        { title: 'الحفاظ على التناسب', desc: 'منع تشوه الصورة أثناء التكبير أو التصغير.' },
        { title: 'أمان وخصوصية تامة', desc: 'معالجة داخل بيئة المتصفح الآمنة.' },
        { title: 'متوافق مع كل الشاشات', desc: 'يعمل بسلاسة على الهواتف والأجهزة اللوحية والحواسيب.' },
      ],
    },
    convert: {
      h2Usage: 'كيفية تحويل صيغ الصور أونلاين؟',
      steps: [
        { title: '1. اختيار الصورة الأصلية', desc: 'اختر ملف JPG أو PNG أو WebP لتحويله.' },
        { title: '2. اختيار الصيغة الجديدة', desc: 'حدد الصيغة المرغوبة حسب احتياجاتك من الشفافية أو الضغط.' },
        { title: '3. حفظ الملف المحول', desc: 'يتم التحويل فورياً داخل المتصفح وبدون تأخير.' },
      ],
      h2Privacy: 'تحويل محلي 100٪ بدون خوادم خارجية',
      privacyParagraph:
        'ملفاتك لا تُرفع إلى أي خادم خارجي؛ التحويل يتم محلياً في الوقت الحقيقي عبر محرك المتصفح.',
      h3Why: 'لماذا التحويل مع ImageTools؟',
      features: [
        { title: 'دعم الشفافية', desc: 'الحفاظ على خلفيات PNG الشفافة.' },
        { title: 'صيغة WebP الحديثة', desc: 'مثالية لتسريع تحميل مواقع الإنترنت.' },
        { title: 'أمان وموثوقية', desc: 'حماية كاملة من تسريب الصور الخاصة.' },
        { title: 'بدون تسجيل حساب', desc: 'وصول مجاني وفوري للجميع.' },
      ],
    },
    crop: {
      h2Usage: 'كيفية قص الصور باحترافية وسهولة؟',
      steps: [
        { title: '1. رفع الصورة', desc: 'أفلت صورتك داخل محرر القص التفاعلي.' },
        { title: '2. ضبط إطار القص', desc: 'حرك وعدل المقاس بحرية أو اختر نسبة جاهزة (مربع 1:1، سينما 16:9).' },
        { title: '3. تنزيل الجزء المقصوص', desc: 'أكد التحديد واحفظ الصورة المقصوصة بدقة عالية.' },
      ],
      h2Privacy: 'قص محلي 100٪ فائق الخصوصية',
      privacyParagraph:
        'تبقى صورتك داخل جلسة المتصفح فقط، ويتم التقطيع على مساحة Canvas محلية دون أي تخزين خارجي.',
      h3Why: 'مزايا القص التفاعلي',
      features: [
        { title: 'نسب أبعاد جاهزة', desc: 'مربع لوسائل التواصل، 16:9 للشاشات العريضة.' },
        { title: 'تحكم سلس وسهل', desc: 'مقابض واضحة حتى على الشاشات التي تعمل باللمس.' },
        { title: 'معالجة خاطفة', desc: 'النتيجة جاهزة في جزء من الثانية.' },
        { title: 'احترام كامل للخصوصية', desc: 'لا يتم جمع أو حفظ أي صور.' },
      ],
    },
    'rotate-flip': {
      h2Usage: 'كيفية تدوير وقلب الصور أونلاين؟',
      steps: [
        { title: '1. إضافة الصورة', desc: 'حدد الصورة التي تحتاج إلى تصحيح اتجاهها.' },
        { title: '2. تطبيق التدوير أو القلب', desc: 'دوّر 90 درجة يميناً أو يساراً، أو اقلب أفقياً وعمودياً بنقرة واحدة.' },
        { title: '3. تحميل النسخة المصححة', desc: 'احصل فوراً على صورتك بالاتجاه الصحيح.' },
      ],
      h2Privacy: 'تدوير محلي بدون فقدان للجودة',
      privacyParagraph:
        'يتم تعديل زاوية العرض مباشرة على المعالج الرسومي للمتصفح دون إرسال نسخ عبر الإنترنت.',
      h3Why: 'لماذا تدوير الصور هنا؟',
      features: [
        { title: 'حفظ جودة الصورة', desc: 'تدوير نظيف بدون ضغط مشوه.' },
        { title: 'تصحيح صور السيلفي', desc: 'إصلاح الصور المقلوبة بضغطة زر.' },
        { title: 'بدون أي وسيط خارجي', desc: 'يعمل بالكامل داخل جهازك.' },
        { title: 'استجابة فورية', desc: 'أزرار سريعة ومريحة.' },
      ],
    },
    watermark: {
      h2Usage: 'كيفية إضافة علامة مائية لحماية الصور؟',
      steps: [
        { title: '1. اختيار الصورة', desc: 'ارفع صورتك أو تصاميمك المراد حمايتها.' },
        { title: '2. تخصيص العلامة المائية', desc: 'اكتب النص، حدد الحجم والشفافية واللون والموضع المطلوب.' },
        { title: '3. تصدير الصورة المحمية', desc: 'حمّل صورتك المختومة بحقوقك وجاهزة للنشر بأمان.' },
      ],
      h2Privacy: 'حماية ملكية فكرية بخصوصية 100٪',
      privacyParagraph:
        'أعمالك وتصاميمك لا تمر بأي خوادم خارجية؛ طباعة العلامة المائية تتم في ذاكرة متصفحك محلياً.',
      h3Why: 'لماذا تحمي صورك؟',
      features: [
        { title: 'منع السرقة والاستخدام غير المصرح', desc: 'حافظ على هويتك وحقوقك الفكرية.' },
        { title: 'تخصيص متكامل', desc: 'تحكم في مستوى الشفافية لدمج أنيق.' },
        { title: 'أمان كامل', desc: 'أصل صورك لن يتعرض للإنترنت.' },
        { title: 'مجاني ودون قيود', desc: 'أضف علامتك على أي عدد من الصور.' },
      ],
    },
    'image-to-pdf': {
      h2Usage: 'كيفية تحويل مجموعة صور إلى ملف PDF واحد؟',
      steps: [
        { title: '1. اختيار الصور', desc: 'أضف صورة أو أكثر بصيغ JPG أو PNG أو WebP.' },
        { title: '2. اختيار الاتجاه والصفحة', desc: 'حدد الاتجاه الرأسي أو الأفقي ومقاس الورق.' },
        { title: '3. إنشاء مستند PDF', desc: 'نزّل ملف PDF المجمع خلال ثوانٍ معدودة.' },
      ],
      h2Privacy: 'تجميع مستندات PDF محلي 100٪ وبأمان تام',
      privacyParagraph:
        'يتم إنشاء ملف PDF بواسطة محرك متجه محلي داخل متصفحك، مما يحمي فواتيرك ومستنداتك الشخصية.',
      h3Why: 'مزايا تحويل الصور إلى PDF محلياً',
      features: [
        { title: 'مقاس A4 القياسي', desc: 'تنسيق مثالي للطباعة والمعاملات الرسمية.' },
        { title: 'دمج عدة مستندات', desc: 'جمع الإيصالات والشهادات في ملف واحد.' },
        { title: 'خصوصية كاملة', desc: 'معالجة مباشرة دون تخزين سحابي.' },
        { title: 'حجم ملف مثالي', desc: 'ضغط ذكي لسهولة الإرسال عبر البريد الإلكتروني.' },
      ],
    },
    'merge-pdf': {
      h2Usage: 'كيفية دمج عدة ملفات PDF في مستند واحد؟',
      steps: [
        { title: '1. إفلات ملفات PDF', desc: 'اسحب وأفلت مستندات PDF متعددة داخل منطقة العمل.' },
        { title: '2. إعادة ترتيب الملفات', desc: 'استخدم أسهم الترتيب لتحديد تسلسل الصفحات النهائي بدقة.' },
        { title: '3. تحميل ملف PDF الموحد', desc: 'انقر على دمج للحصول على مستند موحد جاهز للإرسال.' },
      ],
      h2Privacy: 'دمج PDF محلي 100٪ وشديد السرية',
      privacyParagraph:
        'باستخدام مكتبة pdf-lib داخل المتصفح، تُدمج مستنداتك السرية (العقود، المستندات المالية) محلياً دون إرسال نسخ عبر الشبكة.',
      h3Why: 'لماذا دمج ملفاتك هنا؟',
      features: [
        { title: 'أعلى معايير الأمان', desc: 'مثالي للمستندات القانونية والحساسة.' },
        { title: 'ترتيب مرن', desc: 'تحكم سهل في تسلسل المستندات.' },
        { title: 'بدون حدود عددية', desc: 'ادمج أي عدد من الملفات يدعمه جهازك.' },
        { title: 'سريع وبدون إعلانات مزعجة', desc: 'مساحة عمل احترافية للإنتاجية.' },
      ],
    },
    'split-pdf': {
      h2Usage: 'كيفية تقسيم أو استخراج صفحات من ملف PDF؟',
      steps: [
        { title: '1. رفع مستند PDF', desc: 'اختر ملف PDF متعدد الصفحات الذي ترغب في استخراج صفحات منه.' },
        { title: '2. تحديد نطاق الصفحات', desc: 'أدخل أرقام أو نطاق الصفحات مفصولة بفواصل (مثال: 1-3, 5).' },
        { title: '3. تحميل ملف PDF المستخرج', desc: 'حمّل فوراً مستندك الجديد الذي يحتوي على الصفحات المحددة فقط.' },
      ],
      h2Privacy: 'استخراج صفحات محلي 100٪ دون تسريب',
      privacyParagraph:
        'يتم فصل واستخراج الصفحات داخل ذاكرة المتصفح دون إرسال المستند الأصلي إلى أي خادم.',
      h3Why: 'فوائد تقسيم PDF محلياً',
      features: [
        { title: 'تحديد دقيق للصفحات', desc: 'استخرج الأجزاء المطلوبة فقط.' },
        { title: 'تقليل حجم الملف', desc: 'احذف الصفحات غير المفيدة لتوفير المساحة.' },
        { title: 'حماية الخصوصية', desc: 'لا يُترك أي أثر لملفاتك على الإنترنت.' },
        { title: 'يعمل دون إنترنت', desc: 'سرعة فائقة ومستقرة.' },
      ],
    },
    'rotate-pdf': {
      h2Usage: 'كيفية تدوير صفحات PDF وتصحيح اتجاهها؟',
      steps: [
        { title: '1. رفع ملف PDF', desc: 'أفلت مستند PDF الممسوح ضوئياً أو المقلوب.' },
        { title: '2. اختيار زاوية التدوير', desc: 'دوّر جميع الصفحات 90 درجة مع أو عكس اتجاه عقارب الساعة.' },
        { title: '3. حفظ ملف PDF المعدل', desc: 'نزّل مستندك بالاتجاه الصحيح مع الحفاظ على وضوح الخطوط والرسومات.' },
      ],
      h2Privacy: 'تدوير صفحات PDF محلي وسري 100٪',
      privacyParagraph:
        'يُعدل الاتجاه داخل المعرفات الهندسية لملف PDF على جهازك مباشرة لتبقى مستنداتك سرية تماماً.',
      h3Why: 'لماذا تدوير PDF مع ImageTools؟',
      features: [
        { title: 'إصلاح المستندات الممسوحة', desc: 'تعديل مثالي للأوراق والفواتير المقلوبة.' },
        { title: 'الحفاظ على جودة النص', desc: 'بدون أي ضغط يقلل من دقة القراءة.' },
        { title: 'سرية مطلقة', desc: 'تبقى الملفات داخل جهازك فقط.' },
        { title: 'مجاني ودون قيود', desc: 'صحح أي عدد من الملفات.' },
      ],
    },
    'delete-pdf-pages': {
      h2Usage: 'كيفية حذف صفحات غير مرغوبة من مستند PDF؟',
      steps: [
        { title: '1. فتح ملف PDF', desc: 'أفلت المستند الذي يحتوي على صفحات زائدة.' },
        { title: '2. تحديد أرقام الصفحات المراد حذفها', desc: 'اكتب أرقام أو نطاق الصفحات المراد حذفها (مثال: 2, 4-6).' },
        { title: '3. تحميل ملف PDF المنقح', desc: 'احصل على مستند نظيف ومختصر خلال ثوانٍ.' },
      ],
      h2Privacy: 'حذف صفحات محلي 100٪ وآمن تماماً',
      privacyParagraph:
        'يتم حذف الصفحات وإعادة بناء جدول الكائنات داخل المتصفح دون اتصال بأي خادم سحابي.',
      h3Why: 'فوائد حذف صفحات PDF',
      features: [
        { title: 'إزالة الصفحات الفارغة', desc: 'تنظيف المستندات الممسوحة ضوئياً.' },
        { title: 'حماية المعلومات السرية', desc: 'حذف الأوراق الحساسة قبل المشاركة.' },
        { title: 'بدون خوادم وسيطة', desc: 'معالجة مستقلة تماماً على جهازك.' },
        { title: 'بسيط وسريع', desc: 'بدون حاجة للتسجيل أو دفع رسوم.' },
      ],
    },
    'pdf-to-jpg': {
      h2Usage: 'كيفية تحويل مستند PDF إلى صور JPG عالية الدقة؟',
      steps: [
        { title: '1. رفع ملف PDF', desc: 'اختر المستند متعدد الصفحات لتحويله إلى صور منفردة.' },
        { title: '2. رندر عالي الدقة عبر Canvas', desc: 'يقوم محرك PDF.js برسم كل صفحة بدقة ووضوح فائق.' },
        { title: '3. تنزيل الصور أو ملف ZIP', desc: 'حمّل كل صفحة منفردة أو نزّل كل الصور في ملف مضغوط ZIP بنقرة واحدة.' },
      ],
      h2Privacy: 'تحويل PDF إلى JPG محلي وخاص 100٪',
      privacyParagraph:
        'التحويل يتم بواسطة PDF.js و Canvas داخل متصفحك دون رفع أي مستند إلى خوادم الإنترنت.',
      h3Why: 'لماذا تحويل PDF إلى JPG هنا؟',
      features: [
        { title: 'رندر فائق الدقة (HD)', desc: 'الحفاظ على حدة النصوص والرسوم البيانية.' },
        { title: 'تحميل ملف ZIP بنقرة واحدة', desc: 'تجميع كل الصفحات في مجلد مضغوط ومرتب.' },
        { title: 'أمان كامل للبيانات', desc: 'لا يتم تخزين أي شيء على الويب.' },
        { title: 'بدون طوابير انتظار', desc: 'سرعة معالجة فورية تعتمد على جهازك.' },
      ],
    },
  },
  zh: {
    compress: {
      h2Usage: '如何在线压缩图片？',
      steps: [
        { title: '1. 上传图片', desc: '拖放或选择设备中的 JPG、PNG 或 WebP 图片文件。' },
        { title: '2. 调整压缩质量', desc: '使用滑块在减小体积与保持图像清晰度之间找到最佳平衡。' },
        { title: '3. 立即下载', desc: '实时预览前后对比，点击下载按钮保存优化后的图片。' },
      ],
      h2Privacy: '100% 浏览器本地计算与数据隐私保障',
      privacyParagraph:
        '不同于依赖云端服务器的传统工具，本技术通过 Web Worker 直接在您的浏览器内存中完成图片压缩。文件绝不上传到任何远程服务器，彻底杜绝数据泄露。',
      h3Why: '为什么选择我们的压缩工具？',
      features: [
        { title: '零服务器上传', desc: '您的文件始终留在本地设备中。' },
        { title: '极速响应', desc: '不受网络带宽和排队等待限制。' },
        { title: '免费且无水印', desc: '无限次使用，绝不强制添加任何水印。' },
        { title: '出众画质', desc: '先进优化算法，有效保持画面细节清晰。' },
      ],
    },
    resize: {
      h2Usage: '如何精准调整图片尺寸？',
      steps: [
        { title: '1. 选择待调整图片', desc: '将图片拖入操作区或点击浏览文件。' },
        { title: '2. 设置目标像素尺寸', desc: '输入宽度与高度像素，或使用预设缩放比例，支持锁定宽高比。' },
        { title: '3. 导出新尺寸图片', desc: '利用 HTML5 Canvas 本地高保真重绘，生成清晰成品。' },
      ],
      h2Privacy: '100% 本地隐私安全尺寸调整',
      privacyParagraph:
        '调整尺寸完全调用您设备的显卡与处理器在浏览器内完成，没有任何字节离开您的电脑或手机。',
      h3Why: '本地调整尺寸的优势',
      features: [
        { title: '像素级精准控制', desc: '精确指定所需尺寸。' },
        { title: '锁定宽高比', desc: '防止图片意外拉伸或变形。' },
        { title: '纯客户端处理', desc: '在浏览器沙箱内绝对保密。' },
        { title: '多端完美兼容', desc: '手机、平板与桌面电脑均可流畅运行。' },
      ],
    },
    convert: {
      h2Usage: '如何在线转换图片格式？',
      steps: [
        { title: '1. 导入源图片', desc: '选择需要转换的 JPG、PNG 或 WebP 图片。' },
        { title: '2. 选择目标格式', desc: '根据透明度或体积需求自由切换为 JPG、PNG 或 WebP。' },
        { title: '3. 保存转换后文件', desc: '格式转换由浏览器原生引擎毫秒级实时生成。' },
      ],
      h2Privacy: '100% 本地转换，无需任何中转服务器',
      privacyParagraph:
        '您的文件不会上传至任何第三方云端，所有转换计算均在本地设备上独立完成。',
      h3Why: '为什么使用 ImageTools 转换？',
      features: [
        { title: '保留透明通道', desc: '转为 PNG 完美支持 Alpha 透明背景。' },
        { title: '次世代 WebP', desc: '极大提升网页加载速度并节省流量。' },
        { title: '安全无忧', desc: '杜绝私密相片被网络拦截的风险。' },
        { title: '免注册无门槛', desc: '即开即用，无须创建账号。' },
      ],
    },
    crop: {
      h2Usage: '如何快速裁剪图片？',
      steps: [
        { title: '1. 上传裁剪图片', desc: '将图片置入交互式裁剪画布中。' },
        { title: '2. 调整选框范围', desc: '自由拖动选框或选择预设比例（1:1 正方形、16:9 宽屏等）。' },
        { title: '3. 下载裁剪成品', desc: '确认选区，即刻下载高分辨率裁剪图像。' },
      ],
      h2Privacy: '100% 本地安全私密裁剪',
      privacyParagraph:
        '图片始终限制在当前浏览器会话中，在本地 Canvas 画布上完成剪切，无任何外部存储。',
      h3Why: '交互式裁剪特点',
      features: [
        { title: '常用比例预设', desc: '正方形适合社交头像，16:9 适合横幅海报。' },
        { title: '操作直观便捷', desc: '触控与鼠标皆可精准捕捉边缘。' },
        { title: '瞬时处理', desc: '毫秒级生成裁剪结果。' },
        { title: '严格尊重隐私', desc: '不采集、不存储任何图像数据。' },
      ],
    },
    'rotate-flip': {
      h2Usage: '如何旋转与翻转图片？',
      steps: [
        { title: '1. 添加需要调整的图片', desc: '选择需要修正方向的图片。' },
        { title: '2. 执行旋转或镜像', desc: '向左或向右旋转 90 度，或一键执行水平与垂直翻转。' },
        { title: '3. 下载修正后的图片', desc: '即时获取方向正确的清晰成品。' },
      ],
      h2Privacy: '本地无损几何变换',
      privacyParagraph:
        '旋转调整直接在浏览器图形缓冲区执行，不涉及网络传输，杜绝画质压缩损失。',
      h3Why: '为什么在这里旋转图片？',
      features: [
        { title: '保持原画分辨率', desc: '纯正几何变换，不降低清晰度。' },
        { title: '自拍镜像一键矫正', desc: '快速修复前置摄像头拍出的镜像画面。' },
        { title: '无需外部服务器', desc: '100% 在您的本地设备处理。' },
        { title: '极简操作', desc: '直观按钮，即刻见效。' },
      ],
    },
    watermark: {
      h2Usage: '如何为图片添加防盗水印？',
      steps: [
        { title: '1. 导入待保护图片', desc: '上传您的摄影作品、设计图或证件材料。' },
        { title: '2. 自定义水印样式', desc: '输入自定义文本，调节字体大小、透明度、颜色与显示位置。' },
        { title: '3. 导出带水印图片', desc: '下载打上个人或企业专属版权标识的安全图片。' },
      ],
      h2Privacy: '100% 本地私密版权保护',
      privacyParagraph:
        '您的艺术作品与敏感证照文件绝不会上传至服务器，水印合成纯属浏览器本地内存操作。',
      h3Why: '为什么需要添加水印？',
      features: [
        { title: '防止图片被盗用', desc: '在公开发布前宣示版权归属。' },
        { title: '精致透明度调节', desc: '低调美观，不破坏主体美感。' },
        { title: '全程本地安全', desc: '原始文件绝不暴露在公网。' },
        { title: '免费无限添加', desc: '批量为大量素材打上水印。' },
      ],
    },
    'image-to-pdf': {
      h2Usage: '如何将多张图片合成为一个 PDF 文档？',
      steps: [
        { title: '1. 选择图片文件', desc: '添加一张或多张 JPG、PNG、WebP 图片。' },
        { title: '2. 设置页面版式', desc: '选择纵向（Portrait）或横向（Landscape）布局以及标准纸张大小。' },
        { title: '3. 生成完整 PDF', desc: '数秒内即可合成并下载整洁的 PDF 文档。' },
      ],
      h2Privacy: '100% 本地安全生成 PDF',
      privacyParagraph:
        'PDF 文档由浏览器客户端矢量引擎生成。您的发票、合同单据与身份材料受到最严密的本地保护。',
      h3Why: '本地图片转 PDF 的优势',
      features: [
        { title: '标准 A4 版式', desc: '排版整洁，方便直接打印或办事提交。' },
        { title: '多图一键打包', desc: '将零散收据和证件整理为一份正式文件。' },
        { title: '绝对隐私保证', desc: '无任何云端存储或中转过程。' },
        { title: '智能体积优化', desc: '合理压缩图片，便于邮件附件发送。' },
      ],
    },
    'merge-pdf': {
      h2Usage: '如何将多个 PDF 文件合并为一个文档？',
      steps: [
        { title: '1. 拖入多个 PDF 文件', desc: '将两个或更多 PDF 文件拖放至操作区。' },
        { title: '2. 自由调整文件顺序', desc: '通过上移和下移按钮随心排列最终合并的先后次序。' },
        { title: '3. 下载合并后的 PDF', desc: '点击合并按钮，即时生成并下载完整的新 PDF。' },
      ],
      h2Privacy: '100% 本地安全私密合并 PDF',
      privacyParagraph:
        '借助客户端运行的 pdf-lib，您的敏感文件（如商业合同、薪资单）在本地完成拼合，绝无副本流向网络。',
      h3Why: '为什么在此合并 PDF？',
      features: [
        { title: '顶级安全规格', desc: '处理法务与财务文档的安心之选。' },
        { title: '顺序随心调整', desc: '精准控制每一份文件的排布先后。' },
        { title: '无文件数量限制', desc: '只要设备性能支持，即可自由合并。' },
        { title: '清爽无广告干扰', desc: '纯净高效的专业办公体验。' },
      ],
    },
    'split-pdf': {
      h2Usage: '如何拆分或提取 PDF 中的特定页面？',
      steps: [
        { title: '1. 上传多页 PDF', desc: '导入需要提取或拆分的多页 PDF 文档。' },
        { title: '2. 输入所需页码范围', desc: '用逗号输入指定页码或页码段（例如：1-3, 5）。' },
        { title: '3. 导出精简 PDF', desc: '立即下载仅包含目标页码的新 PDF 文件。' },
      ],
      h2Privacy: '100% 本地拆分，杜绝信息外泄',
      privacyParagraph:
        '页码提取与文档重构完全在浏览器内存中完成，原始文件绝不向云端传输。',
      h3Why: '本地拆分 PDF 的好处',
      features: [
        { title: '精准页面提取', desc: '仅保留需要汇报或使用的核心内容。' },
        { title: '大幅瘦身文档', desc: '去除无关冗余页，方便网络发送。' },
        { title: '保护核心隐私', desc: '在公网无任何残留足迹。' },
        { title: '离线极速运行', desc: '不受网络拥堵影响，稳定可靠。' },
      ],
    },
    'rotate-pdf': {
      h2Usage: '如何旋转 PDF 页面方向？',
      steps: [
        { title: '1. 加载 PDF 文件', desc: '拖入扫描歪斜或方向颠倒的 PDF 文档。' },
        { title: '2. 设定旋转角度', desc: '一键将全部页面顺时针或逆时针旋转 90 度。' },
        { title: '3. 保存矫正后的 PDF', desc: '下载正常朝向的文档，矢量文字与图形质量完好无损。' },
      ],
      h2Privacy: '100% 本地私密旋转 PDF',
      privacyParagraph:
        '旋转仅更新 PDF 内部的显示几何元数据，全过程在本地运行，保护重要商业文档。',
      h3Why: '为什么用 ImageTools 旋转 PDF？',
      features: [
        { title: '修正倒置扫描件', desc: '解决扫描仪将单据倒置录入的烦恼。' },
        { title: '无损画质呈现', desc: '绝无二次有损重编码压缩。' },
        { title: '全面私密保护', desc: '文件完全停留在本地浏览器沙箱内。' },
        { title: '永久免费无限制', desc: '随时修正任意多份文档。' },
      ],
    },
    'delete-pdf-pages': {
      h2Usage: '如何删除 PDF 中不需要的页面？',
      steps: [
        { title: '1. 打开 PDF 文件', desc: '添加含有多余或废弃页面的 PDF。' },
        { title: '2. 指定要剔除的页码', desc: '填写需删除的页码或页段（例如：2, 4-6）。' },
        { title: '3. 下载整理后的 PDF', desc: '数秒内获取剔除干净的精炼新文档。' },
      ],
      h2Privacy: '100% 本地安全删页处理',
      privacyParagraph:
        '页码剔除是在浏览器中即时重建 PDF 对象表，无需连接任何外部服务器。',
      h3Why: '删除 PDF 页面的实用价值',
      features: [
        { title: '清除空白废页', desc: '快速整理扫描录入的空白页面。' },
        { title: '剔除机密信息', desc: '在分发给第三方前移除敏感页。' },
        { title: '免中转服务器', desc: '在您个人电脑上自主完成。' },
        { title: '操作极简高效', desc: '无须注册，即开即用。' },
      ],
    },
    'pdf-to-jpg': {
      h2Usage: '如何将 PDF 文档转换为高清 JPG 图片？',
      steps: [
        { title: '1. 上传 PDF 文件', desc: '选择要转为单张图片的 PDF 文档。' },
        { title: '2. Canvas 引擎高清光栅化', desc: 'PDF.js 高保真还原每一页文字与矢量元素。' },
        { title: '3. 单张或一键 ZIP 打包下载', desc: '逐页保存图片，或一键打包下载全部提取页面的 ZIP 压缩包。' },
      ],
      h2Privacy: '100% 本地私密 PDF 转 JPG',
      privacyParagraph:
        '转换由 PDF.js 与 HTML5 Canvas 直接在本地浏览器中呈现，绝无文件上传到云端服务器。',
      h3Why: '为什么在此将 PDF 转为 JPG？',
      features: [
        { title: '高清细腻画质', desc: '保持字体平滑与图形高清晰度。' },
        { title: '一键 ZIP 打包', desc: '省去反复点击，一键下载全部页面。' },
        { title: '绝对隐私保证', desc: '网络上不留任何缓存。' },
        { title: '零排队即时输出', desc: '完全依赖本地算力，无服务器限速。' },
      ],
    },
  },
};

export const ToolInfoSection: FC<ToolInfoSectionProps> = ({ toolId }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  const langKey = ['fr', 'en', 'ar', 'zh'].includes(currentLang) ? currentLang : 'fr';
  const content = CONTENT[langKey]?.[toolId] || CONTENT.fr[toolId];

  if (!content) return null;

  return (
    <section className="mt-16 space-y-12 border-t border-slate-200/80 pt-12">
      {/* 1. Comment utiliser cet outil ? (H2) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark tracking-tight">
              {content.h2Usage}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Étapes simples, rapides et sans aucune installation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm shadow-primary/30">
                {idx + 1}
              </div>
              <h3 className="font-bold text-dark text-base mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Traitement 100% Local & Sécurité Absolue (H2) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Sécurité & Privacy First</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-dark tracking-tight">
            {content.h2Privacy}
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            {content.privacyParagraph}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Aucun téléversement sur un serveur</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Fonctionne directement dans votre RAM</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Conforme aux normes de confidentialité</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zéro journalisation ou stockage de fichiers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Pourquoi choisir cet outil ? (H3 / Grid) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-dark tracking-tight">
            {content.h3Why}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-primary mb-3">
                {idx === 0 ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : idx === 1 ? (
                  <Zap className="w-4 h-4" />
                ) : idx === 2 ? (
                  <Cpu className="w-4 h-4" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
              </div>
              <h4 className="font-bold text-dark text-sm mb-1">{feat.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
