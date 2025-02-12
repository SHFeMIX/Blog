# CSS 动画实现时钟
<div id="clock">
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
</div>

<div id="hour">
    <div></div>
</div>

<div id="min">
    <div></div>
</div>

<div id="sec">
    <div></div>
</div>

<script setup>
    import { onMounted } from 'vue';
    onMounted(() => {
        const now = new Date();

        const seconds = now.getSeconds();
        const degrees = seconds * 6;
        const clockElement = document.getElementById('sec');
        clockElement.style.transform = `rotate(${degrees}deg)`;

        const min = now.getMinutes();
        const degreesMin = min * 6 + seconds / 60 * 6;
        const minElement = document.getElementById('min');
        minElement.style.transform = `rotate(${degreesMin}deg)`;

        const hour = now.getHours();
        const degreesHour = hour * 30 + min / 60 * 30
        const hourElement = document.getElementById('hour');
        hourElement.style.transform = `rotate(${degreesHour}deg)`;
    })
</script>

<style scoped>
* {
    box-sizing: content-box;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

#clock {
    position: absolute;
    top: 100px;
    left: 100px;
    height: 100px;
    width: 100px;
    border: solid;
    border-radius: 50%;

    .line {
        position: absolute;
        top: 0px;
        left: 49px;
        width: 2px;
        height: 10px;
        background-color: black;
        transform-origin: center 50px;
    }

    .line:nth-child(1) {
        transform: rotate(30deg);
    }

    .line:nth-child(2) {
        transform: rotate(60deg);
    }

    .line:nth-child(3) {
        transform: rotate(90deg);
        height: 20px;
    }

    .line:nth-child(4) {
        transform: rotate(120deg);
    }

    .line:nth-child(5) {
        transform: rotate(150deg);
    }

    .line:nth-child(6) {
        transform: rotate(180deg);
        height: 20px;
    }

    .line:nth-child(7) {
        transform: rotate(210deg);
    }

    .line:nth-child(8) {
        transform: rotate(240deg);
    }

    .line:nth-child(9) {
        transform: rotate(270deg);
        height: 20px;
    }

    .line:nth-child(10) {
        transform: rotate(300deg);
    }

    .line:nth-child(11) {
        transform: rotate(330deg);
    }

    .line:nth-child(12) {
        transform: rotate(360deg);
        height: 20px;
    }
}

#hour,
#min,
#sec {
    position: absolute;
    top: 100px;
    left: 100px;
    width: 106px;
    height: 106px;

    >div {
        margin: 0 auto;
    }
}

#hour {
    >div {
        border-top: solid transparent 28px;
        width: 2px;
        height: 25px;
        background-color: black;

        transform-origin: center 100%;
        animation: rotate 86400s linear infinite;
    }
}

#min {
    >div {
        border-top: solid transparent 18px;
        width: 2px;
        height: 35px;
        background-color: black;

        transform-origin: center 100%;
        animation: rotate 3600s linear infinite;
    }
}

#sec {
    >div {
        border-top: solid transparent 3px;
        width: 1px;
        height: 50px;
        background-color: red;

        transform-origin: center 100%;
        animation: rotate 60s steps(60, end) infinite;
    }
}
</style>