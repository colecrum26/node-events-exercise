let form = document.querySelector("#form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let response = await fetch("http://localhost:5001/newsletter_signup",
    {
        mode: "no-cors",
        redirect: "follow",
        headers: {"content-type": "application/json"},
        method: "POST",
        body: JSON.stringify({name, email})
    });
    let msg = await response.json()
    console.log(msg);
})