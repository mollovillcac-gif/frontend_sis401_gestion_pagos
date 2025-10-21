<script setup>
import { useAuthStore } from '@/stores/index.ts';
import ComoFunciona from '../../components/dashboard/ComoFunciona.vue';
const authStore = useAuthStore();
</script>

<template>
    <nav>
        <div class="nav__header">
            <div class="nav__logo" style="display: flex; align-items: center; gap: 8px">
                <a href="#" class="logo" style="font-size: 2rem; font-weight: bold; color: #f97316; letter-spacing: 2px; text-shadow: 1px 1px 6px rgba(249, 115, 22, 0.2); display: flex; align-items: center"> CARGAS PAFUNNCIO </a>
            </div>
            <div class="nav__menu__btn" id="menu-btn">
                <i class="ri-menu-line"></i>
            </div>
        </div>
        <ul class="nav__links" id="nav-links">
            <li><a href="#home">INICIO</a></li>
            <li><a href="#about">NOSOTROS</a></li>
            <li><a href="#locations">UBICACIONES</a></li>
            <li><a href="#services">SERVICIOS</a></li>
            <li><a href="#contact">CONTACTO</a></li>
            <li><a href="#">REGISTRAR CARGA</a></li>
        </ul>
        <div class="nav__btns">
            <template v-if="!authStore.token">
                <button class="btn" @click="$router.push('/auth/login')">Iniciar Sesión / Registrarse</button>
            </template>
            <template v-else>
                <span style="font-weight: bold; color: #f97316; font-size: 1.1rem; padding: 0.5rem 1.2rem; background: #fff7ed; border-radius: 999px; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.08); display: flex; align-items: center; gap: 1rem">
                    Bienvenido, {{ authStore.user }}
                    <button @click="authStore.logout()" style="margin-left: 0.5rem; background: #f97316; color: white; border: none; border-radius: 999px; padding: 0.3rem 1rem; font-size: 1rem; cursor: pointer">Cerrar sesión</button>
                </span>
                <button
                    @click="$router.push('/pages/solicitudes')"
                    style="
                        cursor: pointer;
                        margin-left: 1rem;
                        margin-top: 1rem;
                        font-size: 1.7rem;
                        color: #f97316;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 2.5rem;
                        height: 2.5rem;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(249, 115, 22, 0.12);
                    "
                    title="Ir a solicitudes"
                >
                    <i class="pi pi-key" style="font-size: 1.5rem; color: #f97316"></i>
                </button>
            </template>
        </div>
    </nav>

    <header id="home">
        <div class="header__container">
            <div class="header__content">
                <p style="color: white">GESTIÓN DE CARGAS Y PAGOS</p>
                <h1 style="color: white">¡Administra tus pagos de forma fácil y segura!</h1>
                <div class="header__btns">
                    <button class="btn" @click="$router.push('/auth/login')">Registrar una solicitud</button>
                </div>
            </div>
        </div>
    </header>

    <!-- Sección Sobre Nosotros -->
    <section class="section__container aboutus__container" id="about">
        <div class="aboutus__grid" style="display: flex; flex-direction: row; gap: 3rem; align-items: center; justify-content: center; flex-wrap: wrap; min-height: 400px">
            <div style="flex: 1 1 350px; max-width: 500px; text-align: left; display: flex; flex-direction: column; justify-content: center; height: 100%">
                <h2 class="section__header" style="font-size: 2.5rem; margin-bottom: 2rem">Sobre Nosotros</h2>
                <p style="font-size: 1.3rem; color: #374151; margin-bottom: 1rem">
                    <strong>Cargas PAFUNNCIO</strong> es un intermediario logístico con sede en <strong>Iquique, Chile</strong>, y presencia en <strong>Bolivia</strong> (Cochabamba, Oruro y Santa Cruz).
                </p>
                <p style="font-size: 1.3rem; color: #374151; margin-bottom: 1rem">Brindamos servicios de pago de contenedores (gate-in), demoras, liberaciones, giros nacionales e internacionales y cambio de divisas (BOB, CLP y USD).</p>
                <p style="font-size: 1.3rem; color: #374151; margin-bottom: 1rem">
                    Nuestro objetivo es facilitar a clientes bolivianos la realización de pagos en territorio chileno de manera <strong>rápida</strong>, <strong>segura</strong> y <strong>confiable</strong>.
                </p>
            </div>
            <div class="aboutus__features" style="flex: 1 1 250px; display: flex; flex-direction: column; gap: 2rem; justify-content: flex-start; align-items: stretch; min-width: 250px; max-width: 350px">
                <div
                    class="aboutus__feature-card"
                    style="
                        background: #fff7ed;
                        border-radius: 1rem;
                        box-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
                        padding: 2rem;
                        text-align: center;
                        border: 2px solid #f97316;
                        min-height: 120px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    "
                >
                    <div style="font-size: 2.7rem; color: #f59e42; margin-bottom: 0.5rem"><i class="ri-flashlight-fill"></i></div>
                    <h4 style="color: #f97316; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.4rem">Rapidez</h4>
                    <p style="color: #374151; font-size: 1.15rem">Procesos optimizados para respuesta inmediata</p>
                </div>
                <div
                    class="aboutus__feature-card"
                    style="
                        background: #e0f2fe;
                        border-radius: 1rem;
                        box-shadow: 0 2px 12px rgba(16, 185, 129, 0.08);
                        padding: 2rem;
                        text-align: center;
                        border: 2px solid #14b8a6;
                        min-height: 120px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    "
                >
                    <div style="font-size: 2.7rem; color: #14b8a6; margin-bottom: 0.5rem"><i class="ri-shield-check-fill"></i></div>
                    <h4 style="color: #14b8a6; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.4rem">Seguridad</h4>
                    <p style="color: #374151; font-size: 1.15rem">Transacciones protegidas y verificadas</p>
                </div>
                <div
                    class="aboutus__feature-card"
                    style="
                        background: #ede9fe;
                        border-radius: 1rem;
                        box-shadow: 0 2px 12px rgba(139, 92, 246, 0.08);
                        padding: 2rem;
                        text-align: center;
                        border: 2px solid #8b5cf6;
                        min-height: 120px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    "
                >
                    <div style="font-size: 2.7rem; color: #8b5cf6; margin-bottom: 0.5rem"><i class="ri-checkbox-circle-fill"></i></div>
                    <h4 style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.4rem">Confiabilidad</h4>
                    <p style="color: #374151; font-size: 1.15rem">Experiencia consolidada en el sector</p>
                </div>
            </div>
        </div>
    </section>
    <!-- Sección Nuestras Ubicaciones -->
    <section class="section__container destination__container" id="locations">
        <h2 class="section__header">Nuestras Ubicaciones</h2>
        <p class="section__description">Presencia estratégica en Chile y Bolivia</p>

        <div class="destination__grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem">
            <div class="destination__card">
                <img src="../../assets/img/imagen-1.jpeg" alt="Iquique, Chile" />
                <div class="destination__card__details">
                    <div>
                        <h4>Iquique</h4>
                        <p>Puerto de Chile, calle Orella #2263</p>
                    </div>
                    <div class="destination__ratings" style="display: flex; align-items: center; gap: 0.5rem">
                        <span style="background: #f97316; color: white; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"> <i class="ri-flag-fill"></i> Chile </span>
                        <a
                            href="https://maps.google.com/?q=-20.2085721,-70.1582876"
                            target="_blank"
                            style="background: #f3f4f6; color: #f97316; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; gap: 0.3rem"
                            ><i class="ri-map-pin-2-fill"></i> Ver ubicación</a
                        >
                    </div>
                </div>
            </div>
            <div class="destination__card">
                <img src="../../assets/img/imagen-2.jpeg" alt="Cochabamba, Bolivia" />
                <div class="destination__card__details">
                    <div>
                        <h4>Cochabamba</h4>
                        <p>Av. Blanco Galindo, zona Aeropuerto</p>
                    </div>
                    <div class="destination__ratings" style="display: flex; align-items: center; gap: 0.5rem">
                        <span style="background: #f97316; color: white; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"> <i class="ri-flag-fill"></i> Bolivia </span>
                        <a
                            href="https://maps.google.com/?q=Av.+Blanco+Galindo,+zona+Aeropuerto,+Cochabamba"
                            target="_blank"
                            style="background: #f3f4f6; color: #f97316; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; gap: 0.3rem"
                            ><i class="ri-map-pin-2-fill"></i> Ver ubicación</a
                        >
                    </div>
                </div>
            </div>
            <div class="destination__card">
                <img src="../../assets/img/imagen-3.jpeg" alt="Oruro, Bolivia" />
                <div class="destination__card__details">
                    <div>
                        <h4>Oruro</h4>
                        <p>Mercado Young</p>
                    </div>
                    <div class="destination__ratings" style="display: flex; align-items: center; gap: 0.5rem">
                        <span style="background: #f97316; color: white; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"> <i class="ri-flag-fill"></i> Bolivia </span>
                        <a
                            href="https://maps.google.com/?q=Mercado+Young,+Oruro"
                            target="_blank"
                            style="background: #f3f4f6; color: #f97316; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; gap: 0.3rem"
                            ><i class="ri-map-pin-2-fill"></i> Ver ubicación</a
                        >
                    </div>
                </div>
            </div>
            <div class="destination__card">
                <img src="../../assets/img/imagen-4.jpeg" alt="Santa Cruz, Bolivia" />
                <div class="destination__card__details">
                    <div>
                        <h4>Santa Cruz</h4>
                        <p>2º anillo</p>
                    </div>
                    <div class="destination__ratings" style="display: flex; align-items: center; gap: 0.5rem">
                        <span style="background: #f97316; color: white; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"> <i class="ri-flag-fill"></i> Bolivia </span>
                        <a
                            href="https://maps.google.com/?q=2+anillo,+Santa+Cruz"
                            target="_blank"
                            style="background: #f3f4f6; color: #f97316; border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.95rem; text-decoration: none; display: flex; align-items: center; gap: 0.3rem"
                            ><i class="ri-map-pin-2-fill"></i> Ver ubicación</a
                        >
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Sección Servicios -->
    <section class="section__container journey__container" id="services">
        <h2 class="section__header">Servicios Disponibles</h2>
        <p class="section__description">Soluciones integrales para el comercio internacional</p>
        <div class="services__grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-top: 2rem">
            <!-- Pago de Gate-in -->
            <div class="service__card" style="background: #eff6ff; border-radius: 1rem; box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08); padding: 2rem; border: 2px solid #3b82f6">
                <div style="font-size: 2.2rem; color: #2563eb; margin-bottom: 0.5rem"><i class="ri-login-box-line"></i></div>
                <h4 style="color: #2563eb; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.3rem">Pago de Gate-in</h4>
                <p style="color: #374151; font-size: 1.05rem; margin-bottom: 1rem">Gestión completa del ingreso de contenedores al puerto. Procesamiento rápido y seguro de los pagos requeridos para el gate-in.</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
                    <span style="background: #dbeafe; color: #2563eb; border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"><i class="ri-check-line"></i> Proceso automatizado</span>
                    <span style="background: #dbeafe; color: #2563eb; border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"><i class="ri-check-line"></i> Confirmación inmediata</span>
                </div>
            </div>

            <!-- Pago de Demoras -->
            <div class="service__card" style="background: #fee2e2; border-radius: 1rem; box-shadow: 0 2px 12px rgba(239, 68, 68, 0.08); padding: 2rem; border: 2px solid #ef4444">
                <div style="font-size: 2.2rem; color: #dc2626; margin-bottom: 0.5rem"><i class="ri-time-line"></i></div>
                <h4 style="color: #dc2626; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.3rem">Pago de Demoras</h4>
                <p style="color: #374151; font-size: 1.05rem; margin-bottom: 1rem">Manejo eficiente de pagos por demoras portuarias. Cálculos precisos y gestión de tiempos de estadía.</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
                    <span style="background: #fee2e2; color: #dc2626; border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"><i class="ri-check-line"></i> Cálculo automático</span>
                    <span style="background: #fee2e2; color: #dc2626; border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"><i class="ri-check-line"></i> Histórico de demoras</span>
                </div>
            </div>

            <!-- Pago de Liberaciones -->
            <div class="service__card" style="background: #dcfce7; border-radius: 1rem; box-shadow: 0 2px 12px rgba(16, 185, 129, 0.08); padding: 2rem; border: 2px solid #10b981">
                <div style="font-size: 2.2rem; color: #059669; margin-bottom: 0.5rem"><i class="ri-lock-line"></i></div>
                <h4 style="color: #059669; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.3rem">Pago de Liberaciones</h4>
                <p style="color: #374151; font-size: 1.05rem; margin-bottom: 1rem">Gestión de liberación de contenedores y mercancías. Trámites aduaneros y documentación completa.</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap">
                    <span style="background: #bbf7d0; color: #059669; border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"><i class="ri-check-line"></i> Documentación completa</span>
                    <span style="background: #bbf7d0; color: #059669; border-radius: 999px; padding: 0.3rem 0.9rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.3rem"><i class="ri-check-line"></i> Seguimiento en tiempo real</span>
                </div>
            </div>
        </div>
        <div class="service__benefits" style="margin-top: 3rem; border-top: 2px solid #f3f4f6; padding-top: 2rem">
            <h3 style="font-size: 1.5rem; font-weight: bold; color: #374151; margin-bottom: 2rem; text-align: center">¿Por qué elegir nuestros servicios?</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem">
                <div style="background: #fff7ed; border-radius: 1rem; padding: 1.5rem; text-align: center; box-shadow: 0 2px 12px rgba(249, 115, 22, 0.08); border: 2px solid #f97316">
                    <div style="font-size: 2rem; color: #f97316; margin-bottom: 0.5rem"><i class="ri-user-3-fill"></i></div>
                    <h4 style="color: #f97316; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.1rem">Atención Personalizada</h4>
                    <p style="color: #374151; font-size: 0.98rem">Equipo especializado para atender sus necesidades específicas</p>
                </div>
                <div style="background: #e0f2fe; border-radius: 1rem; padding: 1.5rem; text-align: center; box-shadow: 0 2px 12px rgba(16, 185, 129, 0.08); border: 2px solid #14b8a6">
                    <div style="font-size: 2rem; color: #14b8a6; margin-bottom: 0.5rem"><i class="ri-smartphone-fill"></i></div>
                    <h4 style="color: #14b8a6; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.1rem">Tecnología Avanzada</h4>
                    <p style="color: #374151; font-size: 0.98rem">Plataforma digital moderna para gestionar todos sus trámites</p>
                </div>
                <div style="background: #ede9fe; border-radius: 1rem; padding: 1.5rem; text-align: center; box-shadow: 0 2px 12px rgba(139, 92, 246, 0.08); border: 2px solid #8b5cf6">
                    <div style="font-size: 2rem; color: #8b5cf6; margin-bottom: 0.5rem"><i class="ri-bar-chart-fill"></i></div>
                    <h4 style="color: #8b5cf6; font-weight: bold; margin-bottom: 0.5rem; font-size: 1.1rem">Transparencia Total</h4>
                    <p style="color: #374151; font-size: 0.98rem">Seguimiento completo y reportes detallados de todas las operaciones</p>
                </div>
            </div>
        </div>
    </section>
    <!-- Sección Datos -->
    <section class="section__container banner__container">
        <div class="banner__card">
            <h4>10+</h4>
            <p>Años de experiencia</p>
        </div>
        <div class="banner__card">
            <h4>12k</h4>
            <p>Clientes satisfechos</p>
        </div>
        <div class="banner__card">
            <h4>4.8</h4>
            <p>Calificación promedio</p>
        </div>
    </section>

    <ComoFunciona />

    <footer id="contact">
        <div class="section__container footer__container">
            <div class="footer__col">
                <div class="footer__logo">
                    <a href="#" class="logo">CargasPafunnncio</a>
                </div>
                <p>Gestiona tus cargas y pagos de manera eficiente y segura. Tu logística en un solo lugar.</p>
                <ul class="footer__socials">
                    <li>
                        <a href="#!"><i class="ri-facebook-fill"></i></a>
                    </li>
                    <li>
                        <a href="#!"><i class="ri-instagram-line"></i></a>
                    </li>
                    <li>
                        <a href="#!"><i class="ri-youtube-line"></i></a>
                    </li>
                </ul>
            </div>
            <div class="footer__col">
                <h4>Enlaces rápidos</h4>
                <ul class="footer__links">
                    <li><a href="#">Inicio</a></li>
                    <li><a href="#about">Nosotros</a></li>
                    <li><a href="#locations">Ubicaciones</a></li>
                    <li><a href="#services">Servicios</a></li>
                </ul>
            </div>
            <div class="footer__col">
                <h4>Contáctanos</h4>
                <ul class="footer__links">
                    <li>
                        <a href="#">
                            <span><i class="ri-phone-fill"></i></span>+569 66547711
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <span><i class="ri-record-mail-line"></i></span>
                            pafunnciomollo@gmail.com
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <span><i class="ri-map-pin-2-fill"></i></span> Iquique, Chile
                        </a>
                    </li>
                </ul>
            </div>
            <div class="footer__col">
                <h4>Suscríbete</h4>
                <form action="#!">
                    <input type="text" placeholder="Ingresa tu email" />
                    <button class="btn">Suscribirse</button>
                </form>
            </div>
        </div>
        <div class="footer__bar">Copyright © 2025 CargasPafunnncio. Todos los derechos reservados.</div>
    </footer>
</template>

<style>
@media (max-width: 900px) {
    .destination__grid {
        grid-template-columns: 1fr !important;
    }
}
</style>
