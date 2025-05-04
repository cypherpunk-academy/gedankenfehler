export const Weltanschauungen = [
    'Materialismus',
    'Sensualismus',
    'Phänomenalismus',
    'Realismus',
    'Dynamismus',
    'Individualismus',
    'Spiritualismus',
    'Pneumatismus',
    'Psychismus',
    'Idealismus',
    'Rationalismus',
    'Mathematismus',
];

export const AutorImages = {
    'freud.png': require('@/assets/images/autoren/freud.png'),
    'schiller.png': require('@/assets/images/autoren/schiller.png'),
    'goethe.png': require('@/assets/images/autoren/goethe.png'),
    'steiner1.png': require('@/assets/images/autoren/steiner1.png'),
    'nietzsche.png': require('@/assets/images/autoren/nietzsche.png'),
    'leibniz.png': require('@/assets/images/autoren/leibniz.png'),
    'steiner2.png': require('@/assets/images/autoren/steiner2.png'),
    'novalis.png': require('@/assets/images/autoren/novalis.png'),
    'fichte.png': require('@/assets/images/autoren/fichte.png'),
    'schelling.png': require('@/assets/images/autoren/schelling.png'),
    'herder.png': require('@/assets/images/autoren/herder.png'),
    'hegel.png': require('@/assets/images/autoren/hegel.png'),
} as const;

// Type-safe way to access the images
export type AutorImageKey = keyof typeof AutorImages;
