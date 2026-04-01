const API_URL = "https://hpw7ts84kb.execute-api.us-east-1.amazonaws.com/prod/order";
const IDENTITY_POOL_ID = "us-east-1:fb3933a4-e05e-4d38-bdca-4f9caa3b8d6e";
const REGION = "us-east-1";

AWS.config.region = REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID
});

async function placeOrder() {
    const output = document.getElementById("output");

    output.className = "output-area visible";
    output.innerHTML = "Submitting order...";

    try {
        await AWS.config.credentials.getPromise();
        const creds = AWS.config.credentials;

        const orderData = {
            name: document.getElementById("name").value,
            drink: document.getElementById("drink").value,
            temperature: document.getElementById("temperature").value,
            size: document.getElementById("size").value,
            extras: document.getElementById("extras").value
                .split(",")
                .map(x => x.trim())
                .filter(x => x.length > 0)
        };

        const endpoint = new AWS.Endpoint(API_URL);
        const request = new AWS.HttpRequest(endpoint, REGION);
        request.method = "POST";
        request.path = endpoint.path;
        request.headers["host"] = endpoint.host;
        request.headers["Content-Type"] = "application/json";
        request.body = JSON.stringify(orderData);

        const signer = new AWS.Signers.V4(request, "execute-api");
        signer.addAuthorization(creds, new Date());

        const signedHeaders = {};
        Object.keys(request.headers).forEach(key => {
            signedHeaders[key] = request.headers[key];
        });

        const response = await fetch(API_URL, {
            method: "POST",
            headers: signedHeaders,
            body: request.body
        });

        const result = await response.json();

        output.className = "output-area visible success";
        output.innerHTML =
            "✅ Order placed!<br><br>" +
            "<strong>" + result.drink + "</strong><br>" +
            "Name: " + result.name + "<br>" +
            "Temp: " + result.temperature + " · Size: " + result.size;

    } catch (err) {
        output.className = "output-area visible error";
        output.innerHTML = "❌ Error: " + err;
    }
}

window.placeOrder = placeOrder;

window.openMenu = function() {
    document.getElementById("menuModal").classList.add("active");
};

window.closeMenu = function() {
    document.getElementById("menuModal").classList.remove("active");
};