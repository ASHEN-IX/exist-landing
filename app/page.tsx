"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers3,
  Menu,
  Play,
  Ruler,
  Search,
  Shirt,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Truck,
  X,
  RotateCcw,
  ShieldCheck,
  Gem,
  Move3D,
  CircleHelp,
} from "lucide-react";
import BrandLogo from "@/components/brand-logo";
import CinematicMedia from "@/components/cinematic-media";
import MaskedHeading from "@/components/masked-heading";
import usePageMotion from "@/hooks/use-page-motion";
import useMagnetic from "@/hooks/use-magnetic";
import { DURATION, EASE_CSS } from "@/lib/motion";

const CATEGORY_URL = "https://www.exist.com.tn/221-costumes-blazers";
const OFFICIAL_URL = "https://www.exist.com.tn/";

const GALLERY = [
  { src: "/images/suit-product-hq.webp", label: "Costume 3 pièces", type: "Silhouette" },
  { src: "/images/tailoring-detail-hq.webp", label: "Finitions", type: "Détails" },
  { src: "/images/wedding-look-hq.webp", label: "En cérémonie", type: "Inspiration" },
] as const;

// Clean campaign photographs; all captions are rendered as live text.
const OCCASIONS = [
  { title: "Mariage", subtitle: "Élégance et distinction", src: "/images/occasion-wedding-hq.webp", number: "01" },
  { title: "Fiançailles", subtitle: "Un style inoubliable", src: "/images/occasion-engagement-hq.webp", number: "02" },
  { title: "Événement pro", subtitle: "Confiance et prestance", src: "/images/occasion-business-hq.webp", number: "03" },
] as const;

const ACCESSORIES = [
  { title: "Chemises", src: "/images/shirt-hq.webp", label: "Une base impeccable" },
  { title: "Cravates", src: "/images/tie-hq.webp", label: "La touche de caractère" },
  { title: "Chaussures", src: "/images/shoes-hq.webp", label: "Le détail qui affirme" },
  { title: "Boutons de manchette", src: "/images/cufflinks-hq.webp", label: "Une finition soignée" },
] as const;

/* -------------------------------------------------------------------------
   Shared button. Motion owns hover/tap here — this element is never touched
   by a GSAP timeline, so the two engines never share a property.
   ------------------------------------------------------------------------- */
function Cta({
  children,
  href,
  secondary = false,
  external = false,
  onClick,
  magnetic = false,
}: {
  children: React.ReactNode;
  href?: string;
  secondary?: boolean;
  external?: boolean;
  onClick?: () => void;
  magnetic?: boolean;
}) {
  const classes = `cta ${secondary ? "cta-outline" : "cta-primary"}`;
  const magRef = useMagnetic<HTMLAnchorElement>(7);
  const magBtnRef = useMagnetic<HTMLButtonElement>(7);

  // The whole interaction — magnetic pull and press — is one CSS transform
  // composed from custom properties. Motion is deliberately NOT used here:
  // it would write `transform` inline and the two would overwrite each other
  // on every frame.
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" size={19} strokeWidth={1.7} className="cta-arrow" />
    </>
  );

  if (href) {
    return (
      <a
        ref={magnetic ? magRef : undefined}
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={magnetic ? magBtnRef : undefined}
      type="button"
      className={classes}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}

/* ---------------------------------------------------------------------- */

function SiteHeader({ onOpenSize }: { onOpenSize: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const jump = () => setMenuOpen(false);

  // NOTE: the scrolled state and the active nav item are driven by
  // ScrollTrigger in usePageMotion — deliberately not by React state, so
  // scrolling never re-renders this component.

  return (
    <header className="site-header">
      <div className="header-shell">
        <a href="#top" className="brand-lockup" aria-label="EXIST — Retour en haut" onClick={jump} data-intro-chrome>
          <BrandLogo light />
          <span className="brand-divider" aria-hidden="true" />
          <span className="product-mark" aria-label="Costume 3 pièces Slim-Fit">
            <Shirt size={23} strokeWidth={1.4} aria-hidden="true" />
            <span>Costume 3 Pièces<br /><em>Slim-Fit</em></span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale" data-intro-chrome>
          <a href="#product">Le costume</a>
          <a href="#occasions" className="active">Cérémonies</a>
          <a href="#fit">Guide des tailles</a>
          <a href="#accessories">Accessoires</a>
        </nav>
        <div className="header-actions" data-intro-chrome>
          <button type="button" className="icon-button desktop-only" title="Guide des tailles" aria-label="Ouvrir le guide des tailles" onClick={onOpenSize}>
            <Search size={20} strokeWidth={1.45} />
          </button>
          <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="icon-button desktop-only" title="EXIST officiel" aria-label="Visiter le site officiel EXIST">
            <Heart size={20} strokeWidth={1.45} />
          </a>
          <a href={CATEGORY_URL} target="_blank" rel="noopener noreferrer" className="icon-button" title="Catalogue EXIST" aria-label="Voir les costumes sur EXIST">
            <ShoppingBag size={20} strokeWidth={1.45} />
          </a>
          <button type="button" className="icon-button menu-button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Navigation mobile" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: DURATION.fast, ease: [...EASE_CSS.out] as [number, number, number, number] }}>
          <a href="#product" onClick={jump}>Le costume</a>
          <a href="#occasions" onClick={jump}>Cérémonies</a>
          <a href="#fit" onClick={jump}>Guide des tailles</a>
          <a href="#accessories" onClick={jump}>Accessoires</a>
        </motion.nav>}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------
   HERO — cinematic opening.
   Structure is layered so each layer can move independently:
     plate (video) → veil (scene A fade) → copy → cue
   ------------------------------------------------------------------------- */
function Hero() {
  const [filmOpen, setFilmOpen] = useState(false);

  return (
    <section id="top" className="hero">
      {/* The film itself. Poster paints first; the clip loads a viewport ahead. */}
      <div className="hero-plate" data-hero-plate>
        <CinematicMedia
          desktop={{ mp4: "/media/hero-desktop-hq.mp4", poster: "/media/hero-desktop-hq.webp" }}
          mobile={{ mp4: "/media/hero-mobile-hq.mp4", poster: "/media/hero-mobile-hq.webp" }}
        />
      </div>

      {/* Scene A: the hero darkens as the user leaves it. */}
      <div className="hero-veil" data-hero-veil aria-hidden="true" />
      {/* First-frame reveal curtain (0.0–0.5 s). */}
      <div className="hero-curtain" data-intro-curtain aria-hidden="true" />

      <div className="hero-container">
        <div className="hero-copy" data-hero-copy>
          <div className="eyebrow light" data-hero-eyebrow>
            <span className="eyebrow-line" /> COLLECTION CÉRÉMONIE
            <span className="eyebrow-year">/ CONCEPT 2026</span>
          </div>

          <h1 className="hero-title" data-hero-line>
            <span className="line-mask">
              <span className="line-inner" data-line-inner>Le Costume</span>
            </span>
            <span className="line-mask">
              <span className="line-inner" data-line-inner>
                3&nbsp;Pièces <span className="hero-highlight">Slim-Fit</span><span className="red-stop">.</span>
              </span>
            </span>
          </h1>

          <div data-hero-support>
            <p>L’alliance entre élégance et modernité, pour les moments où chaque détail compte.</p>
            <div className="hero-ctas">
              <Cta href="#product" magnetic>Découvrir le costume</Cta>
              <motion.button
                type="button"
                className="film-button"
                onClick={() => setFilmOpen(true)}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATION.micro }}
              >
                <span className="play-circle"><Play size={13} fill="currentColor" /></span> Voir le film
              </motion.button>
            </div>
            <div className="hero-mini-tiles" aria-label="Détails du costume">
              <Image quality={90} src="/images/hero-fabric-hq.webp" alt="Texture du tissu" width={54} height={54} />
              <Image quality={90} src="/images/hero-button-hq.webp" alt="Finition des boutons" width={54} height={54} />
              <Image quality={90} src="/images/hero-tie-hq.webp" alt="Nœud de cravate" width={54} height={54} />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom-line" data-hero-cue aria-hidden="true">
        <span>01 <i>/</i> 03</span>
        <div className="progress-pips"><b /><b /><b /></div>
      </div>
      <a className="hero-scroll" href="#benefits" aria-label="Faire défiler vers les avantages" data-hero-cue>
        <span>SCROLLER</span><ArrowDown size={17} />
      </a>
      <div className="hero-concept-tag">PROJET ACADÉMIQUE · NON OFFICIEL</div>

      <AnimatePresence>
        {filmOpen && <FilmModal onClose={() => setFilmOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Benefits() {
  return (
    <section className="benefits" id="benefits" aria-label="Atouts du costume">
      <div className="benefits-inner" data-stagger-kids>
        <div className="benefit"><Shirt aria-hidden="true" /><div><strong>Coupe Slim-Fit</strong><span>Silhouette affirmée</span></div></div>
        <div className="benefit"><Layers3 aria-hidden="true" /><div><strong>Trois pièces</strong><span>Veste, gilet et pantalon</span></div></div>
        <div className="benefit"><Gem aria-hidden="true" /><div><strong>Finitions soignées</strong><span>L’élégance des détails</span></div></div>
        <div className="benefit"><CalendarDays aria-hidden="true" /><div><strong>Pour vos événements</strong><span>Mariage, fiançailles, business</span></div></div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   SCENE B — collection showcase.
   ------------------------------------------------------------------------- */
function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 8, y: x * 10 });
  };

  return (
    <section className="product-section" id="product" data-parallax-scope>
      <div className="section-frame product-layout">
        <div className="product-copy" data-reveal>
          <div className="eyebrow dark"><span className="eyebrow-line" /> LE COSTUME TROIS PIÈCES</div>
          <MaskedHeading
            className="product-title"
            lines={["L’élégance", <em key="e">dans les détails.</em>]}
          />
          <p>Une coupe structurée, une allure moderne et trois pièces à associer pour vos moments les plus marquants.</p>
          <ul className="check-list">
            <li><Check aria-hidden="true" /> Veste structurée</li>
            <li><Check aria-hidden="true" /> Gilet assorti</li>
            <li><Check aria-hidden="true" /> Pantalon Slim-Fit</li>
            <li><Check aria-hidden="true" /> Finitions soignées</li>
          </ul>
          <a className="text-link" href={CATEGORY_URL} target="_blank" rel="noopener noreferrer">
            Voir les modèles EXIST <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>

        <div
          className="product-stage"
          data-reveal-soft
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        >
          <div className="product-aura" aria-hidden="true" />
          <div className="product-ribbon" aria-hidden="true" />
          <div className="gallery-thumbs" role="group" aria-label="Vues du produit">
            {GALLERY.map((item, index) => (
              <button
                type="button"
                key={item.label}
                className={`gallery-thumb ${index === active ? "selected" : ""}`}
                onClick={() => setActive(index)}
                aria-pressed={index === active}
                title={item.label}
              >
                <Image quality={90} src={item.src} alt="" width={55} height={62} />
              </button>
            ))}
          </div>
          <motion.div
            className="product-tilt"
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 110, damping: 20 }}
            style={{ transformStyle: "preserve-3d", perspective: 1200 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                className="product-image-wrap"
                key={active}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: DURATION.fast, ease: [...EASE_CSS.out] as [number, number, number, number] }}
              >
                <Image
                  quality={90}
                  className={`product-main-image${active === 0 ? " product-full-suit" : ""}`}
                  src={GALLERY[active].src}
                  alt={GALLERY[active].label}
                  fill
                  sizes="(max-width: 850px) 80vw, 33vw"
                  priority={active === 0}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <button type="button" className="gallery-prev" onClick={() => setActive(a => (a + GALLERY.length - 1) % GALLERY.length)} aria-label="Image précédente"><ChevronLeft size={21} /></button>
          <button type="button" className="gallery-next" onClick={() => setActive(a => (a + 1) % GALLERY.length)} aria-label="Image suivante"><ChevronRight size={21} /></button>
          <div className="product-perspective-note"><Move3D size={15} aria-hidden="true" /> VUE INTERACTIVE <span>·</span> {GALLERY[active].type.toUpperCase()}</div>
        </div>

        <div className="product-detail" data-parallax="46">
          <div className="detail-image">
            <Image quality={90} src="/images/tailoring-detail-hq.webp" alt="Gros plan sur le tissu, la surpiqûre et les boutons du costume" fill sizes="(max-width: 800px) 90vw, 20vw" />
          </div>
          <span className="detail-index">01 / 03</span>
          <h3>Les détails<br />qui font la différence.</h3>
          <p>Des textures aux finitions, une esthétique pensée pour les occasions importantes.</p>
        </div>
      </div>
      <p className="imagery-disclaimer">Visuels illustratifs de concept : le modèle présenté ne constitue pas une fiche produit officielle d’EXIST.</p>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Occasions() {
  const [active, setActive] = useState(0);
  return (
    <section id="occasions" className="occasions-section">
      <div className="section-frame occasions-layout">
        <div className="occasions-intro" data-reveal>
          <div className="eyebrow light"><span className="eyebrow-line" /> VOS GRANDS MOMENTS</div>
          <MaskedHeading
            className="occasions-title"
            lines={["Un costume,", <em key="p">plusieurs</em>, "occasions."]}
          />
          <div className="small-red-rule" />
          <p>Une même silhouette, différentes façons de vous distinguer.</p>
        </div>
        <div className="occasion-cards" data-stagger-kids>
          {OCCASIONS.map((occasion, i) => (
            <motion.button
              type="button"
              key={occasion.title}
              onClick={() => setActive(i)}
              className={`occasion-card depth-frame ${active === i ? "selected" : ""}`}
              whileTap={{ scale: 0.99 }}
              aria-pressed={active === i}
            >
              <Image quality={90} src={occasion.src} alt={`Inspiration ${occasion.title.toLowerCase()}`} fill sizes="(max-width: 700px) 80vw, 23vw" />
              <span className="occasion-shade" />
              <span className="occasion-number">{occasion.number} / 03</span>
              <span className="occasion-bottom">
                <span className="occasion-title">{occasion.title}</span>
                <span className="occasion-subtitle">{occasion.subtitle}</span>
              </span>
              <span className="occasion-arrow"><ArrowRight size={21} /></span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="occasion-active-rail" aria-label="Sélection de l'occasion">
        <div style={{ width: `${((active + 1) / OCCASIONS.length) * 100}%` }} />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function FitSection({ onOpen }: { onOpen: () => void }) {
  return (
    <section id="fit" className="fit-section">
      <div className="section-frame fit-layout">
        <div className="fit-intro" data-reveal>
          <div className="eyebrow dark"><span className="eyebrow-line" /> VOTRE COUPE</div>
          <MaskedHeading className="fit-title" lines={["Trouvez votre", <em key="t">taille idéale.</em>]} />
          <p>Une estimation simple pour préparer votre essayage, avant de confirmer votre taille en boutique.</p>
        </div>
        <div className="fit-steps" data-stagger-kids>
          <div className="fit-step"><div className="fit-step-icon"><Ruler size={30} strokeWidth={1.3} /></div><b>01</b><strong>Prenez vos mesures</strong><span>Poitrine, taille et stature.</span></div>
          <ArrowRight className="step-arrow" size={25} strokeWidth={1.3} aria-hidden="true" />
          <div className="fit-step"><div className="fit-step-icon"><SlidersHorizontal size={30} strokeWidth={1.3} /></div><b>02</b><strong>Obtenez une estimation</strong><span>Une indication de taille en quelques clics.</span></div>
          <ArrowRight className="step-arrow" size={25} strokeWidth={1.3} aria-hidden="true" />
          <div className="fit-step"><div className="fit-step-icon"><Store size={30} strokeWidth={1.3} /></div><b>03</b><strong>Essayez en magasin</strong><span>Confirmez la coupe avant l’achat.</span></div>
        </div>
        <div className="fit-action" data-reveal><Cta onClick={onOpen}>Guide des tailles</Cta></div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   SCENE C — the details / craft.
   One extreme macro frame with a French editorial line over it, and a
   progress rail that moves as the section scrolls.
   ------------------------------------------------------------------------- */
function Craft() {
  return (
    <section className="craft-section" data-craft aria-label="Les détails de fabrication">
      <div className="craft-media" data-craft-media>
        <CinematicMedia
          desktop={{ mp4: "/media/fabric-detail-hq.mp4", poster: "/media/fabric-detail-hq.webp" }}
          breakpoint={700}
        />
      </div>
      <div className="craft-shade" aria-hidden="true" />

      <div className="section-frame craft-layout">
        <div className="craft-index" data-reveal>
          <span className="craft-num">02</span>
          <span className="craft-rule" />
          <span className="craft-label">LES DÉTAILS</span>
        </div>

        <div className="craft-copy">
          <MaskedHeading
            className="craft-title"
            lines={["Le tissu", <em key="s">se souvient</em>, "du geste."]}
          />
          <p data-reveal>
            Une laine travaillée, des boutons alignés à la main, une boutonnière qui
            tient la ligne. Ce que l’on remarque sans savoir pourquoi.
          </p>
          <dl className="craft-facts" data-stagger-kids>
            <div><dt>Matière</dt><dd>Laine et mélanges fins</dd></div>
            <div><dt>Boutons</dt><dd>Finition satinée</dd></div>
            <div><dt>Surpiqûre</dt><dd>Point régulier, sans tension</dd></div>
          </dl>
        </div>

        <div className="craft-rail-wrap" aria-hidden="true">
          <span className="craft-rail" data-craft-rail />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Accessories() {
  return (
    <section id="accessories" className="accessories-section">
      <div className="section-frame accessories-layout">
        <div className="accessories-intro" data-reveal>
          <div className="eyebrow light"><span className="eyebrow-line" /> L’ART DU DÉTAIL</div>
          <MaskedHeading className="accessories-title" lines={["Complétez", <em key="v">votre look.</em>]} />
          <p>Les détails qui font toute la différence.</p>
        </div>
        <div className="accessory-grid" data-stagger-kids>
          {ACCESSORIES.map((item) => (
            <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer" key={item.title} className="accessory-card depth-frame">
              <div className="accessory-image"><Image quality={90} src={item.src} alt={item.title} fill sizes="(max-width: 600px) 45vw, 18vw" /></div>
              <div className="accessory-info"><div><strong>{item.title}</strong><span>{item.label}</span></div><ArrowRight size={18} aria-hidden="true" /></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function Reassurance() {
  return (
    <section className="reassurance-section">
      <div className="section-frame assurance-layout">
        <div className="assurance-heading" data-reveal><h2>Pourquoi<br />choisir EXIST ?</h2><div className="small-red-rule" /></div>
        <div className="assurance-item" data-reveal><Truck aria-hidden="true" /><div><strong>Livraison offerte</strong><span>Selon les conditions du site officiel</span></div></div>
        <div className="assurance-item" data-reveal><Store aria-hidden="true" /><div><strong>Click &amp; Collect</strong><span>Essayage et paiement en boutique</span></div></div>
        <div className="assurance-item" data-reveal><RotateCcw aria-hidden="true" /><div><strong>Retours et échanges</strong><span>Selon les conditions EXIST en vigueur</span></div></div>
        <div className="assurance-item" data-reveal><ShieldCheck aria-hidden="true" /><div><strong>Achat sur EXIST</strong><span>Commande sur la boutique officielle</span></div></div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   SCENE D — final campaign moment.
   ------------------------------------------------------------------------- */
function Closing() {
  return (
    <section className="closing-section" id="closing">
      <div className="closing-media" data-closing-media>
        <CinematicMedia
          desktop={{ mp4: "/media/closing-campaign-hq.mp4", poster: "/media/closing-campaign-hq.webp" }}
          breakpoint={700}
        />
      </div>
      <div className="closing-shade" aria-hidden="true" />

      <div className="closing-content">
        <div data-reveal>
          <BrandLogo light className="closing-logo" />
        </div>
        <div className="closing-overline" data-reveal>C O L L E C T I O N &nbsp; C É R É M O N I E</div>
        <MaskedHeading
          className="closing-title"
          lines={["Affirmez votre allure.", <em key="m">Marquez le moment.</em>]}
        />
        <p data-reveal>Découvrez les costumes disponibles sur la boutique officielle.</p>
        <div data-reveal><Cta href={CATEGORY_URL} external magnetic>Découvrir la collection</Cta></div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-frame footer-main">
        <div><BrandLogo light /><p>You can’t resist…</p></div>
        <div className="footer-links">
          <a href="#top">Haut de page</a>
          <a href="#product">Le costume</a>
          <a href="#fit">Guide des tailles</a>
          <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">EXIST officiel ↗</a>
        </div>
      </div>
      <div className="footer-disclosure">PROJET UNIVERSITAIRE DE MARKETING DIGITAL · MAQUETTE NON OFFICIELLE, NON AFFILIÉE À EXIST · VISUELS CONCEPTUELS</div>
    </footer>
  );
}

/* ---------------------------------------------------------------------- */

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const [chest, setChest] = useState(100);
  const [waist, setWaist] = useState(86);
  const [height, setHeight] = useState(178);
  const [showResult, setShowResult] = useState(false);
  // Deliberately illustrative heuristic. Not official EXIST sizing data.
  const estimated = Math.max(46, Math.min(58, Math.round(chest / 4) * 2));
  return (
    <motion.div className="modal-backdrop" role="presentation" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.fast }}>
      <motion.div className="modal-card size-modal" role="dialog" aria-modal="true" aria-labelledby="size-title" onMouseDown={e => e.stopPropagation()} initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} transition={{ duration: DURATION.base, ease: [...EASE_CSS.out] as [number, number, number, number] }}>
        <button type="button" className="modal-close" aria-label="Fermer le guide" onClick={onClose}><X /></button>
        <div className="eyebrow dark"><span className="eyebrow-line" /> GUIDE INTERACTIF</div>
        <h2 id="size-title">Votre silhouette.<br /><em>Votre coupe.</em></h2>
        <p>Entrez vos mesures pour obtenir une taille de départ à essayer.</p>
        {!showResult ? <form onSubmit={(e) => { e.preventDefault(); setShowResult(true); }} className="measurements-form">
          <label htmlFor="chest">Tour de poitrine <strong>{chest} cm</strong></label>
          <input id="chest" type="range" min="84" max="124" step="2" value={chest} onChange={e => setChest(Number(e.target.value))} />
          <label htmlFor="waist">Tour de taille <strong>{waist} cm</strong></label>
          <input id="waist" type="range" min="68" max="120" step="2" value={waist} onChange={e => setWaist(Number(e.target.value))} />
          <label htmlFor="height">Votre taille <strong>{height} cm</strong></label>
          <input id="height" type="range" min="155" max="205" step="1" value={height} onChange={e => setHeight(Number(e.target.value))} />
          <button className="cta cta-primary" type="submit">Voir mon estimation <ArrowRight size={18} /></button>
        </form> : <div className="size-result" aria-live="polite">
          <span className="size-result-label">TAILLE EUROPÉENNE INDICATIVE</span>
          <strong className="size-big">{estimated}</strong>
          <p>Cette estimation expérimentale repose essentiellement sur le tour de poitrine. La morphologie, la coupe et le modèle peuvent modifier la taille nécessaire.</p>
          <button type="button" className="text-link reset-button" onClick={() => setShowResult(false)}><RotateCcw size={16} /> Revoir mes mesures</button>
          <a href={CATEGORY_URL} target="_blank" rel="noopener noreferrer" className="cta cta-primary">Voir les costumes disponibles <ArrowRight size={18} /></a>
        </div>}
        <div className="size-caveat"><CircleHelp size={17} /><span>Outil conceptuel non officiel. Aucun conseil de taille n’est garanti. Vérifiez avec le guide officiel ou essayez en boutique.</span></div>
      </motion.div>
    </motion.div>
  );
}

function FilmModal({ onClose }: { onClose: () => void }) {
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setFrame(n => (n + 1) % OCCASIONS.length), 2600);
    return () => window.clearInterval(id);
  }, [paused]);
  return (
    <motion.div className="modal-backdrop" role="presentation" onMouseDown={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.fast }}>
      <motion.div className="modal-card film-modal" role="dialog" aria-modal="true" aria-labelledby="film-title" onMouseDown={e => e.stopPropagation()} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ duration: DURATION.base, ease: [...EASE_CSS.out] as [number, number, number, number] }}>
        <button type="button" className="modal-close light-close" aria-label="Fermer le lookbook" onClick={onClose}><X /></button>
        <span className="film-kicker">EXIST / FILM DE CAMPAGNE — CONCEPT</span>
        <h2 id="film-title">Chaque moment.<br /><em>Votre signature.</em></h2>
        <div className="film-viewport">
          <AnimatePresence mode="wait">
            <motion.div key={frame} className="film-frame" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: DURATION.base }}>
              <Image quality={90} src={OCCASIONS[frame].src} alt={`Séquence ${OCCASIONS[frame].title}`} fill sizes="(max-width: 850px) 100vw, 65vw" />
              <div className="film-frame-overlay"><span>0{frame + 1} / 03</span><strong>{OCCASIONS[frame].title}</strong><p>{OCCASIONS[frame].subtitle}</p></div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="film-controls">
          <span>ANIMATION LOOKBOOK · MAQUETTE, PAS UNE VIDÉO TOURNÉE</span>
          <button type="button" onClick={() => setPaused(v => !v)}>{paused ? "Reprendre" : "Pause"}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------- */

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [sizeOpen, setSizeOpen] = useState(false);

  usePageMotion(root);

  useEffect(() => {
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSizeOpen(false);
    };
    window.addEventListener("keydown", closeEscape);
    return () => window.removeEventListener("keydown", closeEscape);
  }, []);

  // Lock scroll behind the size guide, and keep the page where it was.
  useEffect(() => {
    if (!sizeOpen) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [sizeOpen]);

  return (
    <main ref={root}>
      <SiteHeader onOpenSize={() => setSizeOpen(true)} />
      <Hero />
      <Benefits />
      <ProductShowcase />
      <Occasions />
      <Craft />
      <FitSection onOpen={() => setSizeOpen(true)} />
      <Accessories />
      <Reassurance />
      <Closing />
      <SiteFooter />
      <AnimatePresence>{sizeOpen && <SizeGuideModal onClose={() => setSizeOpen(false)} />}</AnimatePresence>
    </main>
  );
}
