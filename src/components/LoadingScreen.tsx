import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
    onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        // Sequence of animations
        const timer1 = setTimeout(() => setStage(1), 800);  // Show Title
        const timer2 = setTimeout(() => setStage(2), 1800); // Show Subtitle
        const timer3 = setTimeout(() => setStage(3), 3500); // Fade out
        const timer4 = setTimeout(onComplete, 4000);        // Complete

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden">
            {/* Background ambient glow */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 1 ? 0.1 : 0 }}
                transition={{ duration: 2 }}
                className="absolute w-[500px] h-[500px] bg-white rounded-full blur-[150px]"
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* Title */}
                <div className="overflow-hidden mb-4">
                    <motion.h1
                        initial={{ y: 100, opacity: 0 }}
                        animate={{
                            y: stage >= 1 ? 0 : 100,
                            opacity: stage >= 1 ? 1 : 0
                        }}
                        transition={{
                            duration: 1,
                            type: "spring",
                            stiffness: 70
                        }}
                        className="text-7xl font-bold text-white tracking-tighter"
                    >
                        ORBIT VM
                    </motion.h1>
                </div>

                {/* Separator Line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stage >= 2 ? 100 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-[1px] bg-gray-500 mb-4"
                />

                {/* Subtitle */}
                <div className="overflow-hidden">
                    <motion.p
                        initial={{ y: -20, opacity: 0 }}
                        animate={{
                            y: stage >= 2 ? 0 : -20,
                            opacity: stage >= 2 ? 1 : 0
                        }}
                        transition={{ duration: 0.8 }}
                        className="text-sm font-medium text-gray-400 tracking-[0.5em] uppercase"
                    >
                        A Project By APRK
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
