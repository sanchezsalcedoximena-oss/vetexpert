"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppButton() {
  return (
    <motion.a
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-exito text-white shadow-lg shadow-black/20"
      href="https://wa.me/51987654321?text=Hola%20VetExpert%2C%20quiero%20informacion%20sobre%20una%20consulta"
      rel="noreferrer"
      target="_blank"
      title="WhatsApp"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
    >
      <MessageCircle className="h-7 w-7" />
    </motion.a>
  );
}
