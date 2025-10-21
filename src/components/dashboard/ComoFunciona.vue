<script setup>
import { ref, computed, onMounted } from 'vue';
import { ConfiguracionesService } from '@/service/ConfiguracionesService';

// Estado reactivo
const showModal = ref(false);
const modalType = ref('');

// Estado para tipos de cambio
const loadingRates = ref(true);
const tipoCambioUSD = ref(6.96);
const tipoCambioCLP = ref(0.008);
const fechaActualizacion = ref(new Date());

const formatRate = (rate, decimals = 2) => {
    if (!rate) return '0.00';
    return Number(rate).toFixed(decimals);
};

const formatAmount = (amount) => {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const loadExchangeRates = async () => {
    loadingRates.value = true;
    try {
        const response = await ConfiguracionesService.get();
        if (response.data) {
            tipoCambioUSD.value = response.data.tipoCambioUSD || 6.96;
            tipoCambioCLP.value = response.data.tipoCambioCLP || 0.008;
            fechaActualizacion.value = response.data.fechaModificacion ? new Date(response.data.fechaModificacion) : new Date();
        }
    } catch (error) {
        console.error('Error al cargar tipos de cambio:', error);
        // Mantener valores por defecto en caso de error
    } finally {
        loadingRates.value = false;
    }
};

onMounted(() => {
    loadExchangeRates();
});

// Propiedades computadas para el modal
const modalTitle = computed(() => {
    const titles = {
        solicitudes: 'Gestión de Solicitudes',
        cambio: 'Tipos de Cambio',
        seguimiento: 'Estados y Seguimiento'
    };
    return titles[modalType.value] || '';
});

const modalSubtitle = computed(() => {
    const subtitles = {
        solicitudes: 'Todo lo que necesitas saber sobre el proceso de solicitudes',
        cambio: 'Sistema de conversión de monedas actualizado',
        seguimiento: 'Monitoreo en tiempo real de tus procesos'
    };
    return subtitles[modalType.value] || '';
});

const modalIcon = computed(() => {
    const icons = {
        solicitudes: 'ri-file-list-3-line',
        cambio: 'ri-exchange-dollar-line',
        seguimiento: 'ri-bar-chart-grouped-line'
    };
    return icons[modalType.value] || '';
});

const modalWidth = computed(() => {
    return modalType.value === '1200px';
});

// Métodos
const openModal = (type) => {
    modalType.value = type;
    showModal.value = true;
};

const getActionButtonText = () => {
    const texts = {
        solicitudes: 'Ir a Mis Solicitudes',
        cambio: 'Ver Tipos de Cambio',
        seguimiento: 'Ver Estados'
    };
    return texts[modalType.value] || 'Ver más';
};

const getActionButtonIcon = () => {
    const icons = {
        solicitudes: 'ri-external-link-line',
        cambio: 'ri-external-link-line',
        seguimiento: 'ri-external-link-line'
    };
    return icons[modalType.value] || 'ri-arrow-right-line';
};

const handleAction = () => {
    // Redirigir siempre al login
    window.location.href = '/auth/login';
    showModal.value = false;
};
</script>

<template>
    <section class="section__container discover__container">
        <h2 class="section__header">¿Cómo funciona la plataforma?</h2>
        <p class="section__description">Gestiona todo tu proceso logístico en simples pasos:</p>
        <div class="discover__grid">
            <div class="discover__card interactive-card" style="cursor: pointer" @click="openModal('solicitudes')">
                <span><i class="ri-file-list-3-line"></i></span>
                <h4>Solicitudes</h4>
                <p>Registra y gestiona tus solicitudes de carga y pago desde un solo lugar.</p>
                <div class="card-hover-indicator"><i class="ri-eye-line"></i> Ver detalles</div>
            </div>
            <div class="discover__card interactive-card" style="cursor: pointer" @click="openModal('cambio')">
                <span><i class="ri-exchange-dollar-line"></i></span>
                <h4>Tipos de Cambio</h4>
                <p>Consulta los tipos de cambio actualizados para tus transacciones internacionales.</p>
                <div class="card-hover-indicator"><i class="ri-eye-line"></i> Ver detalles</div>
            </div>
            <div class="discover__card interactive-card" style="cursor: pointer" @click="openModal('seguimiento')">
                <span><i class="ri-bar-chart-grouped-line"></i></span>
                <h4>Estados y Seguimiento</h4>
                <p>Visualiza el estado de tus solicitudes y sigue el flujo de cada proceso fácilmente.</p>
                <div class="card-hover-indicator"><i class="ri-eye-line"></i> Ver detalles</div>
            </div>
        </div>
    </section>

    <!-- Dialog Modal -->
    <Dialog v-model:visible="showModal" :modal="true" :closable="true" :style="{ width: modalWidth }" class="info-dialog" :header="modalTitle" :dismissableMask="true">
        <template #header>
            <div class="modal-header">
                <div class="modal-icon">
                    <i :class="modalIcon"></i>
                </div>
                <div>
                    <h3 class="modal-title">{{ modalTitle }}</h3>
                    <p class="modal-subtitle">{{ modalSubtitle }}</p>
                </div>
            </div>
        </template>

        <div class="modal-content">
            <!-- Contenido para Solicitudes -->
            <div v-if="modalType === 'solicitudes'">
                <div class="info-section">
                    <h4><i class="ri-information-line"></i> ¿Qué son las Solicitudes?</h4>
                    <p>Las solicitudes son el núcleo de nuestro sistema de gestión logística. Te permiten registrar y administrar todos los trámites relacionados con tus cargas de manera centralizada y eficiente.</p>
                </div>

                <div class="features-grid">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-add-circle-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Crear Solicitud</h5>
                            <p>Registra nuevas solicitudes con información detallada de tu carga, destino y tipo de servicio requerido.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-upload-cloud-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Subir Comprobantes</h5>
                            <p>Adjunta comprobantes de pago y documentación necesaria directamente en el sistema.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-eye-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Seguimiento</h5>
                            <p>Monitorea el progreso de tus solicitudes en tiempo real con notificaciones automáticas.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-download-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Descargar Facturas</h5>
                            <p>Obtén facturas y documentos finales una vez completado el proceso.</p>
                        </div>
                    </div>
                </div>

                <div class="process-steps">
                    <h4><i class="ri-route-line"></i> Proceso de Solicitud</h4>
                    <div class="steps-container">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h6>Registro Inicial</h6>
                                <p>Completa el formulario con los datos de tu carga</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h6>Verificación</h6>
                                <p>Nuestro equipo revisa y valida la información</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h6>Procesamiento</h6>
                                <p>Se ejecutan los trámites necesarios</p>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h6>Finalización</h6>
                                <p>Recibe confirmación y documentos finales</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido para Tipos de Cambio -->
            <div v-if="modalType === 'cambio'">
                <div class="info-section">
                    <h4><i class="ri-exchange-line"></i> Sistema de Tipos de Cambio</h4>
                    <p>Nuestro sistema mantiene tipos de cambio actualizados para facilitar tus transacciones internacionales entre Bolivia, Chile y Estados Unidos.</p>
                </div>

                <!-- Widget de Tipos de Cambio con datos dinámicos -->
                <div class="exchange-rates-demo">
                    <div v-if="loadingRates" class="flex flex-col items-center justify-center py-12 gap-4">
                        <span class="text-lg m-0" style="color: #6b7280">Cargando tipos de cambio...</span>
                    </div>
                    <div v-else class="rates-grid">
                        <div class="rate-card usd-rate">
                            <div class="rate-header">
                                <div class="rate-icon">
                                    <i class="ri-money-dollar-circle-line"></i>
                                </div>
                                <div class="rate-info">
                                    <h5>USD → BOB</h5>
                                    <p>Dólar a Boliviano</p>
                                </div>
                            </div>
                            <div class="rate-value">{{ formatRate(tipoCambioUSD, 2) }}</div>
                            <div class="rate-example">1 USD = Bs {{ formatAmount(tipoCambioUSD) }}</div>
                        </div>

                        <div class="rate-card clp-rate">
                            <div class="rate-header">
                                <div class="rate-icon">
                                    <i class="ri-money-euro-circle-line"></i>
                                </div>
                                <div class="rate-info">
                                    <h5>CLP → BOB</h5>
                                    <p>Peso Chileno a Boliviano</p>
                                </div>
                            </div>
                            <div class="rate-value">{{ formatRate(tipoCambioCLP, 2) }}</div>
                            <div class="rate-example">1000 CLP = Bs {{ formatRate(tipoCambioCLP, 2) }}</div>
                        </div>
                    </div>
                    <div v-if="!loadingRates" class="text-right text-xs mt-2" style="color: #6b7280">Última actualización: {{ fechaActualizacion.toLocaleString('es-BO') }}</div>
                </div>

                <div class="features-grid">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-refresh-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Actualización Constante</h5>
                            <p>Los tipos de cambio se actualizan regularmente para reflejar las condiciones del mercado.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-calculator-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Calculadora Automática</h5>
                            <p>Sistema automático de conversión para facilitar el cálculo de montos.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-shield-check-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Tasas Confiables</h5>
                            <p>Tipos de cambio basados en fuentes oficiales y verificadas.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-history-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Historial</h5>
                            <p>Accede al historial de tipos de cambio para análisis y reportes.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido para Estados y Seguimiento -->
            <div v-if="modalType === 'seguimiento'">
                <div class="info-section">
                    <h4><i class="ri-git-branch-line"></i> Sistema de Estados y Seguimiento</h4>
                    <p>Mantén control total sobre el progreso de tus solicitudes con nuestro sistema de seguimiento en tiempo real.</p>
                </div>

                <!-- Flujo de Estados Simplificado -->
                <div class="status-flow-demo">
                    <div class="flow-step active">
                        <div class="flow-icon pending">
                            <i class="ri-hourglass-line"></i>
                        </div>
                        <div class="flow-content">
                            <h5>Pendiente</h5>
                            <p>Solicitud recibida, esperando comprobante</p>
                        </div>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step">
                        <div class="flow-icon uploaded">
                            <i class="ri-upload-line"></i>
                        </div>
                        <div class="flow-content">
                            <h5>Subido</h5>
                            <p>Comprobante cargado, en revisión</p>
                        </div>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step">
                        <div class="flow-icon verified">
                            <i class="ri-verified-badge-line"></i>
                        </div>
                        <div class="flow-content">
                            <h5>Verificado</h5>
                            <p>Aprobado, listo para procesamiento</p>
                        </div>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step">
                        <div class="flow-icon completed">
                            <i class="ri-check-double-line"></i>
                        </div>
                        <div class="flow-content">
                            <h5>Pagado</h5>
                            <p>Proceso completado exitosamente</p>
                        </div>
                    </div>
                </div>

                <div class="features-grid">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-notification-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Notificaciones</h5>
                            <p>Recibe alertas automáticas cuando cambie el estado de tu solicitud.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-time-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Tiempo Real</h5>
                            <p>Información actualizada instantáneamente sin necesidad de recargar.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-file-text-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Detalles Completos</h5>
                            <p>Accede a información detallada de cada etapa del proceso.</p>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="ri-bar-chart-line"></i>
                        </div>
                        <div class="feature-content">
                            <h5>Reportes</h5>
                            <p>Genera reportes de estado para tus registros y seguimiento.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="modal-footer">
                <Button label="Cerrar" icon="ri-close-line" @click="showModal = false" class="p-button-secondary" />
                <Button :label="getActionButtonText()" :icon="getActionButtonIcon()" @click="handleAction()" class="p-button-primary" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
/* Estilos para las tarjetas interactivas */
.interactive-card {
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
}

.interactive-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-hover-indicator {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    background: #f97316;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.interactive-card:hover .card-hover-indicator {
    opacity: 1;
    transform: translateY(0);
}

/* Estilos del modal */
.info-dialog {
    border-radius: 1rem;
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.modal-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: #374151;
}

.modal-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
}

.modal-content {
    padding: 1rem 0;
    max-height: 60vh;
    overflow-y: auto;
}

.info-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    border-left: 4px solid #f97316;
}

.info-section h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-section p {
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.feature-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.feature-content h5 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.5rem 0;
}

.feature-content p {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
}

/* Estilos para el proceso de solicitudes */
.process-steps {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

.process-steps h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.steps-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.step {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.step-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
}

.step-content h6 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.25rem 0;
}

.step-content p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

/* Estilos para la demo de tipos de cambio */
.exchange-rates-demo {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    margin-bottom: 2rem;
}

.rates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.rate-card {
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.usd-rate {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border-color: #3b82f6;
}

.clp-rate {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    border-color: #ef4444;
}

.rate-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.rate-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.usd-rate .rate-icon {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.clp-rate .rate-icon {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}

.rate-info h5 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    color: #374151;
}

.rate-info p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.rate-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #374151;
    text-align: center;
    margin-bottom: 0.5rem;
    font-family: monospace;
}

.rate-example {
    text-align: center;
    font-size: 1rem;
    color: #6b7280;
    font-weight: 500;
}

/* Estilos para la demo de estados */
.status-flow-demo {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow-x: auto;
}

.flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
    min-width: 120px;
}

.flow-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.flow-icon.pending {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.flow-icon.uploaded {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.flow-icon.verified {
    background: linear-gradient(135deg, #10b981, #059669);
}

.flow-icon.completed {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.flow-content {
    text-align: center;
}

.flow-content h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.25rem 0;
}

.flow-content p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.flow-connector {
    width: 40px;
    height: 2px;
    background: linear-gradient(to right, #d1d5db, #9ca3af);
    flex-shrink: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
    .features-grid {
        grid-template-columns: 1fr;
    }

    .steps-container {
        grid-template-columns: 1fr;
    }

    .rates-grid {
        grid-template-columns: 1fr;
    }

    .status-flow-demo {
        flex-direction: column;
        gap: 1.5rem;
    }

    .flow-connector {
        width: 2px;
        height: 40px;
        background: linear-gradient(to bottom, #d1d5db, #9ca3af);
    }
}
</style>
