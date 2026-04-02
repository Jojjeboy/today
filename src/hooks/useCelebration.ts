import { useTranslation } from 'react-i18next';

export const useCelebration = () => {
    const { t } = useTranslation();

    const getCelebrationMessage = () => {
        // Safe access to i18n data with fallbacks
        const compliments = t('celebration.compliments', { returnObjects: true });
        const niceThings = t('celebration.niceThings', { returnObjects: true });

        // Fallback arrays if i18n fails to return objects
        const fallbackCompliments = ["Great job!", "Well done!", "You did it!", "Amazing!"];
        const fallbackNiceThings = ["Time for a break?", "Enjoy your success!", "You're on a roll!", "Keep it up!"];

        const complimentsArray = Array.isArray(compliments) ? compliments : fallbackCompliments;
        const niceThingsArray = Array.isArray(niceThings) ? niceThings : fallbackNiceThings;

        const randomCompliment = complimentsArray[Math.floor(Math.random() * complimentsArray.length)];
        const randomNiceThing = niceThingsArray[Math.floor(Math.random() * niceThingsArray.length)];

        return `${randomCompliment} ${randomNiceThing}`;
    };

    return { getCelebrationMessage };
};
