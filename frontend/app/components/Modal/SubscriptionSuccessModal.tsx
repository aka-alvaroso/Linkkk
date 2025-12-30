"use client";
import { useEffect, useRef } from "react";
import { TbCheck } from "react-icons/tb";
import Modal from "@/app/components/ui/Modal/Modal";
import Button from "@/app/components/ui/Button/Button";
import * as motion from "motion/react-client";
import confetti from "canvas-confetti";

interface SubscriptionSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubscriptionSuccessModal({
  open,
  onClose,
}: SubscriptionSuccessModalProps) {
  const checkIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && checkIconRef.current) {
      // Wait for animations to complete
      setTimeout(() => {
        if (!checkIconRef.current) return;

        // Get check icon position
        const rect = checkIconRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        // Burst from check icon
        const count = 80;
        const defaults = {
          origin: { x, y },
          zIndex: 9999,
        };

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        // Fire multiple bursts in a circular pattern
        fire(0.25, {
          spread: 40,
          startVelocity: 20,
          scalar: 0.8,
        });
        fire(0.2, {
          spread: 50,
          startVelocity: 25,
        });
        fire(0.35, {
          spread: 60,
          decay: 0.91,
          scalar: 0.9,
        });
        fire(0.1, {
          spread: 70,
          startVelocity: 15,
          decay: 0.92,
          scalar: 1.2,
        });
      }, 500); // Wait for check icon animation
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      position="center"
      rounded="3xl"
      closeOnOverlayClick={true}
      showCloseButton={false}
    >
      <div className="p-6 space-y-6">
        {/* Header with Icon */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            ref={checkIconRef}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="p-4 bg-primary rounded-full"
          >
            <TbCheck size={64} className="text-dark" strokeWidth={2.5} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: "backInOut" }}
            className="text-3xl font-black italic text-dark text-center"
          >
            ¡Bienvenido a PRO!
          </motion.h2>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: "backInOut" }}
          className="text-dark/70 text-center leading-relaxed"
        >
          Tu suscripción está activa. Ahora tienes acceso ilimitado a todas las funciones PRO.
          ¡Empieza a crear links sin límites!
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "backInOut" }}
          className="pt-2"
        >
          <Button
            variant="solid"
            size="md"
            rounded="2xl"
            onClick={onClose}
            className="w-full hover:bg-primary hover:text-dark hover:shadow-[4px_4px_0_var(--color-dark)]"
          >
            Comenzar
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
