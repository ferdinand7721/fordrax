export const ANIMATIONS = {
    float: {
        initial: { y: 0 },
        animate: {
            y: [-10, 10],
            transition: {
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut",
            },
        },
    },
    pulse: {
        animate: {
            opacity: [1, 0.5, 1],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    },
};
