"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe
} from "lucide-react";
import { ContactForm } from "./ContactForm";
import { WhatsAppButton } from "./WhatsAppButton";

const servicios = [
  {
    titulo: "Consulta veterinaria",
    descripcion: "Evaluaciones clínicas completas con seguimiento claro para cada mascota.",
    icono: Stethoscope
  },
  {
    titulo: "Vacunación",
    descripcion: "Calendarios preventivos, recordatorios y control seguro por etapa de vida.",
    icono: Syringe
  },
  {
    titulo: "Urgencias",
    descripcion: "Atención prioritaria para síntomas agudos, dolor, heridas o cambios bruscos.",
    icono: HeartPulse
  }
];

const promociones = [
  "Chequeo preventivo con orientación nutricional",
  "Plan cachorro con primera vacuna y control",
  "Baño medicado con evaluación dermatológica"
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-fondo text-texto">
      <HeroSection />
      <ServiciosSection />
      <PromocionesSection />
      <SobreNosotrosSection />
      <ContactoSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}

function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-20">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a className="text-lg font-bold text-white" href="#inicio">
          VetExpert
        </a>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/78 md:flex">
          <a className="hover:text-white" href="#servicios">
            Servicios
          </a>
          <a className="hover:text-white" href="#promociones">
            Promociones
          </a>
          <a className="hover:text-white" href="#nosotros">
            Nosotros
          </a>
          <a className="hover:text-white" href="#contacto">
            Contacto
          </a>
        </nav>
        <a
          className="rounded-md bg-white px-4 py-2 text-sm font-bold text-primario transition hover:bg-white/90"
          href="/staff/login"
        >
          Staff
        </a>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-[92vh] bg-slate-950 text-white">
      <Header />
      <img
        alt="Veterinaria revisando a un perro en consulta"
        className="absolute inset-0 h-full w-full object-cover"
        src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1800&q=85"
      />
      <div className="absolute inset-0 bg-slate-950/58" />
      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Veterinaria moderna en Junín - Perú
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Cuidado veterinario profesional, cercano y digital.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
            Consultas, vacunas, controles preventivos y acompanamiento clínico con una experiencia pensada para
            mascotas y familias exigentes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-md bg-primario px-5 py-3 text-center text-sm font-bold text-white" href="#contacto">
              Reservar orientación
            </a>
            <a
              className="rounded-md border border-white/35 px-5 py-3 text-center text-sm font-bold text-white"
              href="#servicios"
            >
              Ver servicios
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServiciosSection() {
  return (
    <section id="servicios" className="bg-fondo px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          etiqueta="Servicios"
          titulo="Atención clara para cada etapa"
          descripcion="Procesos ordenados, comunicación simple y cuidado clínico enfocado en prevenir antes de corregir."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {servicios.map((servicio) => {
            const Icono = servicio.icono;

            return (
              <motion.article
                key={servicio.titulo}
                className="rounded-md border border-borde bg-superficie p-6"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primario/12 text-primario">
                  <Icono className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{servicio.titulo}</h3>
                <p className="mt-3 text-sm leading-6 text-texto/68">{servicio.descripcion}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PromocionesSection() {
  return (
    <section id="promociones" className="bg-superficie px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionTitle
          etiqueta="Promociones"
          titulo="Planes de bienvenida"
          descripcion="Opciones pensadas para iniciar el cuidado preventivo sin perder calidad clínica."
        />
        <div className="grid gap-3">
          {promociones.map((promocion) => (
            <div key={promocion} className="flex items-center gap-3 rounded-md border border-borde bg-fondo p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-exito" />
              <span className="text-sm font-semibold">{promocion}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SobreNosotrosSection() {
  return (
    <section id="nosotros" className="bg-fondo px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
        <div className="overflow-hidden rounded-md border border-borde bg-superficie">
          <img
            alt="Equipo veterinario en clinica"
            className="h-full min-h-[320px] w-full object-cover"
            src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=85"
          />
        </div>
        <div>
          <SectionTitle
            etiqueta="Sobre nosotros"
            titulo="Un equipo que combina criterio clínico y calidez"
            descripcion="Trabajamos con protocolos claros, historias ordenadas y comunicación humana para que cada familia entienda que necesita su mascota y por qué."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric valor="12+" etiqueta="años de experiencia" />
            <Metric valor="4.9" etiqueta="satisfacción promedio" />
            <Metric valor="24h" etiqueta="respuesta prioritaria" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactoSection() {
  return (
    <section id="contacto" className="bg-superficie px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionTitle
            etiqueta="Contacto"
            titulo="Conversemos sobre tu mascota"
            descripcion="Envianos tus datos y el motivo de consulta. El equipo revisara tu mensaje y te respondera por el canal mas practico."
          />
          <div className="mt-8 space-y-4 text-sm text-texto/72">
            <p className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primario" />
              +51 987 551 480
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primario" />
              Ca. Alhelíes 100, Huancayo
            </p>
            <p className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-primario" />
              Lunes a sabado, 8:00 a.m. - 7:00 p.m.
            </p>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
        <p className="font-bold text-white">VetExpert</p>
        <p>Atención veterinaria profesional para familias responsables.</p>
        <p>2026 VetExpert</p>
      </div>
    </footer>
  );
}

function SectionTitle({
  descripcion,
  etiqueta,
  titulo
}: {
  descripcion: string;
  etiqueta: string;
  titulo: string;
}) {
  return (
    <div>
      <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-primario">
        <Sparkles className="h-4 w-4" />
        {etiqueta}
      </p>
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{titulo}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-texto/68 sm:text-base">{descripcion}</p>
    </div>
  );
}

function Metric({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-md border border-borde bg-superficie p-4">
      <p className="text-2xl font-bold text-primario">{valor}</p>
      <p className="mt-1 text-sm text-texto/68">{etiqueta}</p>
    </div>
  );
}
