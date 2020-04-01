const fetch = require("node-fetch");
var fs = require("fs");
sha1 = require('js-sha1');
const concat = require("concat-stream")
var FormData = require('form-data');
var axios = require('axios')

const TOKEN = ''
const URL = `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${TOKEN}`
const URL_SUBMIT = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${TOKEN}`

fetch(URL, {
    method: 'get'
})
    .then(function (response) {
        return response.json()
    }).then(function (resp) {

        fs.writeFile("answer.txt", JSON.stringify(resp), (err) => {
            if (err) console.log(err);
            console.log("Arquivo criado/atualizado com sucesso");
            lerArquivo()
        });

    }).catch(function (error) {
        console.log(error)
    })

let data_json = '';
let resposta;
lerArquivo()

function lerArquivo() {
    fs.readFile("answer.txt", "utf-8", (err, data) => {
        data_json = JSON.parse(data)
        main();
    });
}

function main() {
    decifrado = decodifica(data_json.cifrado)
    sha1 = sha1(decifrado)

    resposta = new Object({
        numero_casas: data_json.numero_casas,
        token: data_json.token,
        cifrado: data_json.cifrado,
        decifrado: decifrado,
        resumo_criptografico: sha1
    })

    fs.writeFileSync('./answer.txt', JSON.stringify(resposta, null, 2), 'utf-8');
    mandar()
}


function mandar() {
    const fd = new FormData()

    fd.append("answer", fs.createReadStream("answer.txt"))
    fd.pipe(concat(data => {
        axios.post(URL_SUBMIT, data, {
            headers: fd.getHeaders()
        }).then(res => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res)
        })
            .catch(error => {
                console.error(error)
            })
    }))
}


function decodifica(texto) {

    let decifrado = ''

    // Pega cada letra do texto cifrado
    for (let i = 0; i < texto.length; i++) {

        // Converte a letra em número da tabela ascii
        letra = texto.charCodeAt(i);

        // Se a letra for de a-z, usa o número de casas para decriptografar
        if (letra > 96 && letra < 123) {
            letra -= data_json.numero_casas;

            // Se a letra for menor que 'a', precisamos adicionar o intervalo para achar a correspondência
            if (letra < 96) {
                letra += 26
            }
        }

        // Converte para letra novamente
        letra = String.fromCharCode(letra)

        // Concatena no texto decifrado
        decifrado += letra;
    }
    return decifrado;
}