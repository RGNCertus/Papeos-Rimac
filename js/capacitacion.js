const btnVolver =
document.getElementById("btnVolver");

const scoreEl =
document.getElementById("score");

const progressBar =
document.getElementById("progressBar");

const certificado =
document.getElementById("certificado");

let puntuacion = 0;
let respondidas = 0;

btnVolver.addEventListener("click",()=>{

    window.location.href =
    "index.html";

});

function respuesta(
    boton,
    correcta
){

    const botones =
    boton.parentElement.querySelectorAll(
        "button"
    );

    botones.forEach(btn=>{

        btn.disabled = true;

    });

    respondidas++;

    if(correcta){

        puntuacion++;

        boton.classList.add(
            "correcta"
        );

        boton.textContent =
        "✔ Correcto";

        reproducirCorrecto();

    }
    else{

        boton.classList.add(
            "incorrecta"
        );

        boton.textContent =
        "✖ Incorrecto";

    }

    scoreEl.textContent =
    puntuacion;

    actualizarBarra();

    if(respondidas === 3){

        setTimeout(()=>{

            certificado.style.display =
            "flex";

        },1000);

    }

}

function actualizarBarra(){

    const porcentaje =
    (respondidas / 3) * 100;

    progressBar.style.width =
    porcentaje + "%";

}

function cerrarCertificado(){

    certificado.style.display =
    "none";

}

function reproducirCorrecto(){

    const audio =
    new Audio(
    "success.mp3"
    );

    audio.volume = 0.4;

    audio.play();

}
