import crefin from '../../assets/images/crefin.png';
import travel from '../../assets/images/travel.png';
import realEstate from '../../assets/images/realEstate.png';
import ayla from '../../assets/images/ayla.png';

interface Project {
    id: number;
    name: string;
    description: string;
    tools: string[];
    code: string;
    demo: string;
    image: string;
    role: string;
}

export const projects: Project[] = [
    {
        id: 1,
        name: "Crunch Africa",
        description: "Fintech App developed with Flutter. Implemented complex features including QR code scanning, Firebase authentication, and comprehensive testing suite including unit, widget, and integration tests. Used Bloc for state management and integrated Sentry for error tracking.",
        tools: ["Flutter", "Bloc", "Firebase", "Sentry", "Unit Testing", "Widget Testing"],
        code: "",
        demo: "https://apps.apple.com/us/app/crunch-africa/id1537297077",
        image: "assets/images/projects/crunch-africa.webp",
        role: "Mobile App Architect",
    },
    {
        id: 2,
        name: "Akyurt Online",
        description: "E-commerce mobile application built for both iOS and Android platforms. Implemented complex UI components, integrated backend API services, and implemented secure payment processing systems using Provider pattern for state management.",
        tools: ["Flutter", "Provider", "REST API", "Payment Integration"],
        code: "",
        demo: "https://apps.apple.com/us/app/akyurt-online/id1542598367",
        image: "assets/images/projects/akyurt-online.webp",
        role: "Flutter Developer",
    },
    {
        id: 3,
        name: "Baredex",
        description: "Mobile application with focus on REST API integration and data management. Implemented Provider pattern for efficient state management and created a robust architecture for API communication.",
        tools: ["Flutter", "Provider", "REST API"],
        code: "",
        demo: "https://play.google.com/store/apps/details?id=com.breadex.app",
        image: "assets/images/projects/baredex.webp",
        role: "Flutter Developer",
    },


];