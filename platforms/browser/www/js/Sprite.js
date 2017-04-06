function Sprite(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;

    this.desenha = function(xCanvas, yCanvas) {
        ctx.drawImage(img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura);
    }
}
var adStatus = false;
var bg = new Sprite(0, 0, 600, 600),
        spriteBoneco = new Sprite(618, 16, 87, 87),
        perdeu = new Sprite(603, 478, 397, 358),
        jogar = new Sprite(603, 127, 397, 347),
        novo = new Sprite(68, 721, 287, 93),
        spriteRecord = new Sprite(28, 879, 441, 95),
        spriteChao = new Sprite(0, 604, 600, 54),
        spriteShare = new Sprite(871, 0, 63, 63);


var canvas, ctx, ALTURA, LARGURA, VELOCIDADE = 6, maxPulos = 3, estadoAtual, record, img,
        estados = {
            jogar: 0,
            jogando: 1,
            perdeu: 2
        },
chao = {
    y: 550,
    x: 0,
    altura: 50,
    atualiza: function() {
        this.x -= VELOCIDADE;
        if (this.x <= -30)
            this.x = 0;
    },
    desenha: function() {
        spriteChao.desenha(this.x, this.y);
        spriteChao.desenha(this.x + spriteChao.largura, this.y);
    }
},
bloco = {
    x: 50,
    y: 0,
    altura: spriteBoneco.altura,
    largura: spriteBoneco.largura,
    gravidade: 0.7,
    velocidade: 0,
    forcaDoPulo: 18,
    qntPulos: 0,
    score: 0,
    rotacao: 0,
    vidas: 3,
    colidindo: false,
    atualiza: function() {
        this.velocidade += this.gravidade;
        this.y += this.velocidade;
        this.rotacao += Math.PI / 180 * VELOCIDADE;

        if (this.y > chao.y - this.altura && estadoAtual != estados.perdeu) {
            this.y = chao.y - this.altura;
            this.qntPulos = 0;
            this.velocidade = 0;
        }
    },
    pula: function() {
        if (this.qntPulos < maxPulos) {
            this.velocidade = -this.forcaDoPulo;
            this.qntPulos++;
        }
    },
    reset: function() {
        this.velocidade = 0;
        this.y = 0;
        if (this.score > record) {
            record = this.score;
            localStorage.setItem("record", this.score);
        }
        this.vidas = 3;
        this.score = 0;
    },
    desenha: function() {
        ctx.save();
        ctx.translate(this.x + this.largura / 2, this.y + this.altura / 2);
        ctx.rotate(this.rotacao);
        spriteBoneco.desenha(-this.largura / 2, -this.altura / 2);
        ctx.restore();
    }
},
obstaculos = {
    _obs: [],
    _cor: ["#ffbc1c", "#ff1c1c", "#ff85e1", "#52a7ff", "#78ff5d"],
    timerInsere: 0,
    insere: function() {
        this._obs.push({
            x: LARGURA,
            altura: 20 + Math.floor(100 * Math.random()),
            //largura: 50 + Math.floor(10 * Math.random()),
            largura: 35,
            cor: this._cor[Math.floor(4 * Math.random())]
        });

        this.timerInsere = 40 + Math.floor(20 * Math.random());
    },
    atualiza: function() {
        if (this.timerInsere == 0)
            this.insere();

        else
            this.timerInsere--;

        for (var i = 0, tam = this._obs.length; i < tam; i++) {
            var obj = this._obs[i];
            obj.x -= VELOCIDADE;

            if (!bloco.colidindo && obj.x <= bloco.x + bloco.largura && bloco.x <= obj.x + obj.largura && chao.y - obj.altura <= bloco.y + bloco.altura)
            {
                bloco.colidindo = true;

                setTimeout(function() {
                    bloco.colidindo = false;
                }, 500);
                vibration();
                if (bloco.vidas >= 1)
                    bloco.vidas--;
                else
                    estadoAtual = estados.perdeu;

            }
            else if (obj.x == 0)
                bloco.score++;

            else if (obj.x <= -obj.largura) {
                this._obs.splice(i, 1);
                tam--;
                i--;
            }
        }
    },
    limpa: function() {
        this._obs = [];
    },
    desenha: function() {
        for (var i = 0, tam = this._obs.length; i < tam; i++) {
            var obj = this._obs[i];

            // img = new Image();
            //img.src = "sprites/espeto.png";
            // img.attr({w: Crafty.viewport.width, h: Crafty.viewport.height})
            ctx.fillStyle = obj.cor;
            ctx.fillRect(obj.x, chao.y - obj.altura, obj.largura, obj.altura);

        }
    }
};

function clique(event) {
    if (estadoAtual == estados.jogar) {
        estadoAtual = estados.jogando;
        frames = 0;
        //callMeToShowBanners(true);
    }

    else if (estadoAtual == estados.perdeu && bloco.y >= 2 * ALTURA) {
        estadoAtual = estados.jogar;
        obstaculos.limpa();
        vibrationPattern();
        bloco.reset();
        //callMeToShowBanners(true);
        //initApp();
    }

    else if (estadoAtual == estados.jogando) {
        bloco.pula();
        //callMeToShowBanners(false);
    }
}

function main() {

    ALTURA = window.innerHeight;
    LARGURA = window.innerWidth;

    if (LARGURA >= 500) {
        LARGURA = 600;
        ALTURA = 600;
    }

    canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = ALTURA;
    canvas.style.border = "1px solid #000";

    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    document.addEventListener("mousedown", clique);

    estadoAtual = estados.jogar;

    record = localStorage.getItem("record");

    if (record == undefined)
        record = 0;

    img = new Image();
    img.src = "sprites/imagens.png";

    roda();
}

function roda() {
    atualiza();
    desenha();

    window.requestAnimationFrame(roda);
}

function atualiza() {
    if (estadoAtual == estados.jogando)
        obstaculos.atualiza();

    chao.atualiza();
    bloco.atualiza();
}

function desenha() {
    bg.desenha(0, 0);
    //ctx.css({'border-radius': '5px', 'text-decoration': 'line-through', 'background-color': '#00ff00'});
    ctx.fillStyle = "rgb(0,0,255)";
    ctx.font = "50px Arial";
    var corBarraLife = "rgb(0,255,0)";
    if (bloco.vidas == 3) {
        corBarraLife = "rgb(0,255,0)";
    } else if (bloco.vidas == 2) {
        corBarraLife = "rgb(255,255,0)";
    } else {
        corBarraLife = "rgb(255,0,0)";
    }


    ctx.fillText(bloco.score, 30, 120);
    ctx.fillStyle = corBarraLife;
    ctx.fillText(bloco.vidas, 100, 120);
    //Crafty.e('2D, DOM, Color').attr({x: 80, y: 120, w: 50, h: 10}).color('#F00');

    if (estadoAtual == estados.jogando)
        obstaculos.desenha();

    chao.desenha();
    bloco.desenha();

    if (estadoAtual == estados.jogar) {
        jogar.desenha(LARGURA / 2 - jogar.largura / 2, ALTURA / 2 - jogar.altura / 2);
        adStatus = false;
    }

    if (estadoAtual == estados.perdeu) {
        perdeu.desenha(LARGURA / 2 - perdeu.largura / 2, ALTURA / 2 - perdeu.altura / 2 - spriteRecord.altura / 2);

        spriteRecord.desenha(LARGURA / 2 - spriteRecord.largura / 2, ALTURA / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 25);

        /*  spriteShare.desenha(LARGURA / 2 - spriteShare.largura / 2, 120);
         spriteShare.onmouseover = function() {
         alert('teste');
         }*/

        ctx.fillStyle = "#fff";
        ctx.fillText(bloco.score, 200, 390);

        if (bloco.score > record) {
            novo.desenha(LARGURA / 2 - 180, ALTURA / 2 + 30);
            ctx.fillText(bloco.score, 420, 470);
        }

        else {
            ctx.fillText(record, 420, 470);
        }
        /**
         * @Call ADDS when he dies Only one time each die....
         * */
        if (!adStatus) {
            admob.requestInterstitialAd({
                autoShowInterstitial: true
            });
            adStatus = true;
        }



    }


}


function onDeviceReady() {

    document.removeEventListener('deviceready', onDeviceReady, false);
    //On device ready start

    // Set AdMobAds options:
    admob.setOptions({
        bannerAtTop: true, // set to true, to put banner at top
        overlap: true,
        publisherId: "ca-app-pub-5450650045028162/8895453492"
                //tappxIdAndroid: "/120940746/Pub-15089-Android-1352",
                //tappxShare: 0.5
    });
    admob.createBannerView({
        autoShowBanner: true
    });


    var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    };

    window.plugins.OneSignal
            .startInit("c9ac340e-10f4-40fd-8851-41586db099d1")
            .handleNotificationOpened(notificationOpenedCallback)
            .endInit();

    // Call syncHashedEmail anywhere in your app if you have the user's email.
    // This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
    // window.plugins.OneSignal.syncHashedEmail(userEmail);
    //admob.requestInterstitial();
    Crafty.init();
    main();
}

document.addEventListener("deviceready", onDeviceReady, false);

function vibration() {
    var time = 200;
    navigator.vibrate(time);
}

function vibrationPattern() {
    var pattern = [150, 300, 600, 1200];
    navigator.vibrate(pattern);
}
