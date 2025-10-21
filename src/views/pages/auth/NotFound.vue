<script>
import Button from 'primevue/button';

export default {
    components: {
        Button
    },
    methods: {
        goHome() {
            this.$router.push('/');
        }
    }
};
</script>

<template>
    <div class="not-found-container">
        <img src="@/assets/img/404.png" alt="404" class="not-found-image" />
        <div class="not-found-content">
            <p class="not-found-description">Lo sentimos, la página que buscas no existe. Puede que la URL esté mal escrita o que la página haya sido movida a otra ubicación.</p>
            <Button label="VOLVER A LA PÁGINA PRINCIPAL" @click="goHome" class="return-button" />
        </div>
    </div>
</template>

<style>
.not-found-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 300px;
    text-align: center;
}

.not-found-image {
    width: 450px;
    margin-right: 25px;
}

.not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.not-found-description {
    font-size: 1.5rem;
    color: #666;
    line-height: 1.5;
    margin-bottom: 20px;
}

.return-button {
    margin-top: 10px;
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 5px;
}
</style>
