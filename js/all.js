var colorArr = ["#54C7FC","#FFCD00","#FF9600","#FF2851","#0076FF","#44DB5E","#FF3824","#999999"]
var comboArr = []
var alphaCoords = [];
var colSelected = 0;

var can=document.getElementById("myCanvas");
var ctx=can.getContext("2d");

var myText = "";

function sizeCanvas(){
    $("#overlay").height(window.outerHeight);
    can.height = (window.innerWidth>window.innerHeight)?(window.innerHeight-80):(window.innerWidth -440);
    if(can.height<700){
        can.height = 700;
    }
    can.width = can.height;
    $("#result").width(can.width + 440);
    var leftMar = window.innerWidth/2 - $("#result").width()/2;
    $("#result").css({
        left : leftMar + "px"
    });
    $("#result").hide();
    $("#logo").css({
        left : (parseInt($("#result").css('left'))+50)+"px"
    })
}

function bindEvents(){
    $(".mode").unbind('click').bind('click',function(){
        var idx = $(this).index();
        
        $(".mode").removeClass("selected");
        $(this).addClass("selected");
        
        $(".chooseFrom").hide();
        $(".chooseFrom:eq("+idx+")").show();
    });
    
    $("#poemList li").unbind('click').bind('click',function(){
        $("#result").show();
        $("#enterInfo").hide();
        dispPoem($(this).index());
        fromList($(this).index());
    });
    
    $("#colors li").unbind('click').bind('click',function(){
        colSelected = $(this).index();
        plotCurve();
    });
    
    $("#createAnother").unbind('click').bind('click',function(){
        createNew();
    });
    
    
    $("#generateThis").unbind('click').bind('click',function(){
        generated();
    });
}

function setAlphaCoords(){
    for(var i = 97; i<=122; i++){
        if(i<=109){
            alphaCoords[i] = {
                x: Math.round(150*Math.cos(getAngle(i))),
                y: Math.round(150*Math.sin(getAngle(i)))
            }
        }
        else{
            alphaCoords[i]={
                x: Math.round(300*Math.cos(getAngle(i))),
                y: Math.round(300*Math.sin(getAngle(i)))   
            }
        }
    }
};
    
function getAngle(i){
    var pi = Math.PI;
    if(i<=109){
        return (i-97)*2*Math.PI/13;
    }
    else{
        return ((i-110)*2*Math.PI/13 + Math.PI/26);
    }
};

function fromList(i){
    myText = poems[i];
    simplifyText();
};

function generated(){
    $("#result").show();
    myText = $("#poemText").val();
    
    $("#title").html($("#poemTitle").val());
    $("#author").html($("#poemAuth").val());
    
    var value = $("#poemText").val().replace(/\n/g, '<br/>');
    $("#entirePoem").html(value);
    
    $("#enterInfo").hide();
    simplifyText();
}

function createNew(){
    responsiveVoice.cancel();
    $("#overlay").show();
    $(".poemInfo").val('')
    $("#enterInfo").show();
    $("#result").hide();
}

function simplifyText(){
    
    comboArr = [];
    
    myText = myText.replace("<br/>",'');
    myText = myText.replace(/\s/g, '');
    var plainText = "";
    
    var asc = 0;
    for(var i=0; i<=myText.length-1; i++){
        asc = myText.charCodeAt(i);
        if((asc>=65 && asc <=90)||(asc>=97 && asc <=122))
            {
                plainText+=myText.substr(i,1).toLowerCase();
            }
    };
    
    fillArr(plainText);
};

function fillArr(plainText){
    for(var i=0; i<=plainText.length - 2; i++){
        var combo = plainText.substr(i,1)+plainText.substr(i+1,1);
        var revCombo = plainText.substr(i+1,1) + plainText.substr(i,1);
        var flag = 0;
        
        for(var j=0; j<=comboArr.length-1; j++){
            if (comboArr[j].pair == combo || comboArr[j].pair == revCombo){
                comboArr[j].count++;
                flag = 1;
            };
            
            if(flag == 1){
                break;
            };
        };
        
        if(flag == 0){
            comboArr.push(
                {
                    pair:combo,
                    count:1
                }
            )
        }
    };
    plotCurve();
};

function plotCurve(){
    
    readOut();
    
    ctx.clearRect(0,0,can.height,can.width);
    $("#overlay").hide();
    var a=.001;
    var rad = 1;
    var delay = 70;

    var i=0,j=0;
     function myLoop(){
       setTimeout(function () {
            j++;
            var start = comboArr[i].pair.charCodeAt(0);
            var end = comboArr[i].pair.charCodeAt(1);
            ctx.strokeStyle = changeStroke(j);

            if(start == end){
                ctx.beginPath();
                ctx.arc(alphaCoords[start].x+can.width/2,350 - alphaCoords[start].y,rad,0,2*Math.PI);
                ctx.stroke();
            }

            else{
                var coeff = getEqParam(a,start,end);
                var smallX, largeX = 0;
                if(alphaCoords[start].x<alphaCoords[end].x){
                    smallX = alphaCoords[start].x;
                    largeX = alphaCoords[end].x
                }
                else{
                    smallX = alphaCoords[end].x;
                    largeX = alphaCoords[start].x
                };

                var k = smallX;

                while(k<largeX){
                    var x = k + can.width/2;
                    var y = 350 - (a*k*k + coeff.b*k + coeff.c);
                    ctx.beginPath();
                    ctx.moveTo(x,y);

                    k=k+1;

                    x = k + can.width/2;
                    y = 350 - (a*k*k + coeff.b*k + coeff.c);

                    ctx.lineTo(x,y);
                    ctx.stroke();
                }
            }

            if(j==comboArr[i].count){
                i++;
                j = 0;
                a=.001;
                rad = 1;
            }

            rad+=3;
            a+=.0005;
           
            if (j <= comboArr[i].count && i<=comboArr.length-1){
              myLoop()
            }

       }, delay);
     }
    myLoop();
    drawAlpha();
    
};

function dispPoem(i){
    $("#title").html($("#poemList li:eq("+i+") .poemListTitle").html());
    $("#author").html($("#poemList li:eq("+i+") .poemListAuth").html());
    $("#entirePoem").html(poems[i]);
}

function readOut(){
    
    var val = $("#entirePoem").html();
    var readValue = val.replace(/.<br\/><br\/>|.<br><br>|<br\/><br\/>|<br><br>/g, '.');
    readValue = readValue.replace(/<br\/>|<br>/g, ' ');
    responsiveVoice.cancel();
    responsiveVoice.speak(readValue, "US English Male", {rate: 1});
}

function changeStroke(i){
    var col = "";
    switch(colSelected){
        case 0:
            col = colorArr[Math.floor(Math.random()*8)];
            return col;
            break;
            
        case 1:
            col = "rgba(84, 199, 252, +"+1/i+")";
            return col;
            break;
            
        case 2:
            col = "rgba(255, 205, 0, +"+1/i+")";
            return col;
            break;
            
        case 3:
            col = "rgba(255, 150, 0, +"+1/i+")";
            return col;
            break;
            
        case 4:
            col = "rgba(255, 40, 81, +"+1/i+")";
            return col;
            break;
            
        case 5:
            col = "rgba(0, 118, 255, +"+1/i+")";
            return col;
            break;
            
         case 6:
            col = "rgba(68, 219, 94, +"+1/i+")";
            return col;
            break;
            
         case 7:
            col = "rgba(255, 56, 36, +"+1/i+")";
            return col;
            break;
        case 8:
            col = "rgba(153, 153, 153, +"+1/i+")";
            return col;
            break;
            
        default:
            col = "rgba("+getColor()+","+getColor()+","+getColor()+",1)";
            return col;
    }
    
    var col = "rgba("+getColor()+","+getColor()+","+getColor()+",1)";
    return col;
}

function getColor(){
    return Math.floor(Math.random()*256);
}

function getEqParam(a, start, end){
    var x1 = alphaCoords[start].x;
    var y1 = alphaCoords[start].y;
    var x2 = alphaCoords[end].x;
    var y2 = alphaCoords[end].y;
    
    var coeff1= (y2-y1)/(x2-x1) - a*(x2+x1);
    var coeff2= y2 - x2*(y2-y1)/(x2-x1) + a*x1*x2;
    
    return {
        b: coeff1,
        c: coeff2
    };
};

/*function setlabels(){
    var canPos = $("#myCanvas").offset();
    $("#title").css({
        top: canPos.top + can.height - 200 +"px",
        left: canPos.left + can.width - $("#title").width()/2 +"px"
    });
    
    var titlePos = $("#title").offset();
    $("#author").css({
        top: titlePos.top + $("#title").height() + 40 +"px",
        left: titlePos.left -10 +"px"
    })
};*/

function drawAlpha(){
    ctx.fillStyle = "#eee";
    for(var i=97; i<=122; i++){
        ctx.beginPath();
        ctx.arc(alphaCoords[i].x+can.width/2,350-alphaCoords[i].y,1,0,2*Math.PI);
        ctx.fill();
    }

}

$(window).bind('load',function() {
    
    setAlphaCoords();
    sizeCanvas();
    bindEvents();
    
    var dummy = new responsiveVoice;
    if(responsiveVoice.isPlaying()) {
      responsiveVoice.cancel();
    }
    
    responsiveVoice.cancel();

    //simplifyText();
});