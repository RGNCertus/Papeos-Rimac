document.getElementById("btnVolver").addEventListener("click", () => {
    window.location.href = "index.html";
});

function respuesta(boton, correcta){

    if(correcta){
        boton.classList.add("correcta");
        boton.textContent = "✔ Correcto";
    }
    else{
        boton.classList.add("incorrecta");
        boton.textContent = "✖ Incorrecto";
    }

    const botones =
    boton.parentElement.querySelectorAll("button");

    botones.forEach(btn=>{
        btn.disabled = true;
    });
}