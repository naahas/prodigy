


var socket = io();
socket.on('connect' , () => { console.log(socket.id)});


//VUE SECTION
var app = new Vue({

    el: '#app',

    data: function() {
        return {
            testo: "kakarot",
            typeVALUE: '',
            date: Date.now(),
            logged_user: '',
            log_username: '',
            log_password: '',
            sign_username: '',
            sign_password: '',
            change_username: '',
            change_password: '',
            new_password: '',
            change_mail: '',
            sign_mail: '',
            showError: false,
            errorMsg: '',
            selectedProfil: true,
            selectedFavorite: false,
            selectedMessage: false,
            selectedPreference: false,
            selectedHelp: false,
            showProfilError: false,
            errorProfilMsg: '',
            croomID: '',
            roomChoice: '',
            finalAnswer: '',
            finalAnswernb: '',
            current_timer : 15,
            mail_reset: '',
            players: [
                
            ],
            playercount: 0,
            answers: '',
            c_question: '',
            c_timer: '',
            playerlife: '',
            current_type: ''
        }
    },


    methods: {

        reloadPage: function() {
            window.location.reload();
        },

        returnHome: function() {
            location.href = '/';
        },

        logSubmit: function() {
            this.log_username = this.$refs.logname_input.value;
            this.log_password = this.$refs.logmdp_input.value;

            var body = {
                username: this.log_username,
                password: this.log_password
            };

            var config = {
            method: 'post',
            url: '/login',
            data: body
            };

            axios(config)
            .then(function (res) {
                if(res.status==200) passError(res.data);
                else SuccLog();
            })
            .catch(function (err) {
                console.log(err);
            });   

           
        },

        signSubmit: function() {

            this.sign_username = this.$refs.name_input.value;
            this.sign_mail = this.$refs.mail_input.value;
            this.sign_password = this.$refs.mdp_input.value;

            var body = {
                username:  this.sign_username,
                mail: this.sign_mail,
                password: this.sign_password
            };

            var config = {
                method: 'post',
                url: '/register',
                data: body
            };

            axios(config)
            .then(function (res) {
                if(res.status==200) passError(res.data);
                else SuccSign();
            })
            .catch(function (err) {
                console.log(err);
            });   


        },


        editError: function(err) {
            this.errorMsg = err;
            this.showError = true;
        },

        redirectMain: function() {
            location.href = '/';
        },

        returnHome: function() {
            location.href = '/home';
        },

        submitEdit: function() {

            this.change_username = this.$refs.pname_input.value;
            this.change_mail = this.$refs.pmail_input.value;
            this.change_password = this.$refs.pmdp_input.value;
            this.new_password = this.$refs.pnewmdp_input.value;

            console.log(this.change_username)
            console.log(this.change_password)
            console.log(this.change_mail)
            console.log(this.new_password)

            //TODO SUBMIT PROFIL POST REQUEST
            
        },

        selectList: function(svalue) {
            if(svalue == "profil") {
                this.selectedProfil = true;
                this.selectedFavorite = false;
                this.selectedMessage = false;
                this.selectedPreference = false;
                this.selectedHelp = false;
            }


            if(svalue == "favorite") {
                this.selectedProfil = false;
                this.selectedFavorite = true;
                this.selectedMessage = false;
                this.selectedPreference = false;
                this.selectedHelp = false;
            }

            if(svalue == "message") {
                this.selectedProfil = false;
                this.selectedFavorite = false;
                this.selectedMessage = true;
                this.selectedPreference = false;
                this.selectedHelp = false;
            }

            if(svalue == "preference") {
                this.selectedProfil = false;
                this.selectedFavorite = false;
                this.selectedMessage = false;
                this.selectedPreference = true;
                this.selectedHelp = false;
            }

            if(svalue == "help") {
                this.selectedProfil = false;
                this.selectedFavorite = false;
                this.selectedMessage = false;
                this.selectedPreference = false;
                this.selectedHelp = true;
            }
                
        },

        
        displayCode: function() {
            $('#popup').hide();
            $('.codewrap').show();
            $('.codediv').fadeIn(100);
            $('.codediv').removeClass('transform-out2').addClass('transform-in2');
            $('#inputroom').val('');
            $('#inputroom').trigger('focus');
        },



        //JOIN LOBBY REQUEST
        joinLobby: function() {

            $('#inputroom').val('');

            var body = {
                val: 'join',
                roomchoice: this.roomChoice
            };

            var config = {
                method: 'post',
                url: '/play',
                data: body
            };

            axios(config)
            .then(function (res) {
               if(res.data.length>0) SuccJoin(res.data);
               else errorCodeInput();
            })
            .catch(function (err) {
                console.log(err);
            });
        },


        //CREATE LOBBY REQUEST
        createLobby: function() {

            var body = {
                val: 'create'
            };

            var config = {
                method: 'post',
                url: '/play',
                data: body
            };

            axios(config)
            .then(function (res) {
                SuccCreate(res.data);
            })
            .catch(function (err) {
                console.log(err);
            });

        },

        startGame: function() {
            var body = {
                val: this.croomID
            };

            var config = {
                method: 'post',
                url: '/quiz',
                data: body
            };

            axios(config)
            .then(function (res) {
                gameRedirect();
            })
            .catch(function (err) {
                console.log(err);
            });
        },


        passQuestion: function(value) {

            if(value == 0) {

                var body = {
                    allow: 'true'
                };

                var config = {
                    method: 'post',
                    url: '/passQroute',
                    data: body
                };

                axios(config)
                .then(function (res) {
                    window.location.href = '/result';
                })
                .catch(function (err) {
                    console.log(err);
                });

            } 

            if(value == 1) {
                
                var body = {
                    allow: 'true'
                };

                var config = {
                    method: 'post',
                    url: '/passResult',
                    data: body
                };

                axios(config)
                .then(function (res) {
                    if(res.data != 'endGame') window.location.href = '/quiz';
                    else window.location.href = '/endGame';
                })
                .catch(function (err) {
                    console.log(err);
                });

            }


        },


        selectAnswer: function(answer_nb) {

            if(answer_nb == 1) {
                this.finalAnswernb = 1;
                this.finalAnswer = document.getElementById("answer1btn").textContent;
                document.getElementById("answer1btn").classList.add("selectclass");
                $('.imgres1').addClass('imgresanim');
                $('#answer2btn').prop('disabled' , true);
                $('#answer3btn').prop('disabled' , true);
                $('#answer4btn').prop('disabled' , true);
                $("#answer2btn").unbind('mouseenter');
                $("#answer3btn").unbind('mouseenter');
                $("#answer4btn").unbind('mouseenter');

                var body = {
                    val: this.finalAnswer,
                    valnb: this.finalAnswernb
                };
    
                var config = {
                    method: 'post',
                    url: '/validateAnswer',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                    // gameRedirect();
                })
                .catch(function (err) {
                    console.log(err);
                });
                
            }

            if(answer_nb == 2) {
                this.finalAnswernb = 2;
                this.finalAnswer = document.getElementById("answer2btn").textContent; 
                document.getElementById("answer2btn").classList.add("selectclass");
                $('.imgres2').addClass('imgresanim');
                $('#answer1btn').prop('disabled' , true);
                $('#answer3btn').prop('disabled' , true);
                $('#answer4btn').prop('disabled' , true);
                $("#answer1btn").unbind('mouseenter');
                $("#answer3btn").unbind('mouseenter');
                $("#answer4btn").unbind('mouseenter');

                var body = {
                    val: this.finalAnswer,
                    valnb: this.finalAnswernb
                };
    
                var config = {
                    method: 'post',
                    url: '/validateAnswer',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                    // gameRedirect();
                })
                .catch(function (err) {
                    console.log(err);
                });
            }

            if(answer_nb == 3) {
                this.finalAnswernb = 3;
                this.finalAnswer = document.getElementById("answer3btn").textContent;
                document.getElementById("answer3btn").classList.add("selectclass");
                $('.imgres3').addClass('imgresanim');
                $('#answer1btn').prop('disabled' , true);
                $('#answer2btn').prop('disabled' , true);
                $('#answer4btn').prop('disabled' , true);
                $("#answer1btn").unbind('mouseenter');
                $("#answer2btn").unbind('mouseenter');
                $("#answer4btn").unbind('mouseenter');

                var body = {
                    val: this.finalAnswer,
                    valnb: this.finalAnswernb
                };
    
                var config = {
                    method: 'post',
                    url: '/validateAnswer',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                    // gameRedirect();
                })
                .catch(function (err) {
                    console.log(err);
                });
            }

            if(answer_nb == 4) {
                this.finalAnswernb = 4;
                this.finalAnswer = document.getElementById("answer4btn").textContent;
                document.getElementById("answer4btn").classList.add("selectclass");
                $('.imgres4').addClass('imgresanim');
                $('#answer1btn').prop('disabled' , true);
                $('#answer2btn').prop('disabled' , true);
                $('#answer3btn').prop('disabled' , true);
                $("#answer1btn").unbind('mouseenter');
                $("#answer2btn").unbind('mouseenter');
                $("#answer3btn").unbind('mouseenter');

                var body = {
                    val: this.finalAnswer,
                    valnb: this.finalAnswernb
                };
    
                var config = {
                    method: 'post',
                    url: '/validateAnswer',
                    data: body
                };
    
                axios(config)
                .then(function (res) {
                    // gameRedirect();
                })
                .catch(function (err) {
                    console.log(err);
                });
            }


            if(answer_nb != 1 && answer_nb != 2 && answer_nb != 3 && answer_nb != 4) {
                console.log("Cannot get answer ):");
            }

            // console.log('selected answer : ' , this.finalAnswer + '(' + answer_nb + ')');
            
            
        },


        logOut: function() {
            axios({
                method: 'post',
                url: '/logout'
              });

              this.reloadPage();

              
        },


        goToProfil: function() {

            window.location.href = '/profil'

        },


        resetPassword: function() {
            var body = {
                val: this.mail_reset
            };

            var config = {
                method: 'post',
                url: '/resetPassword',
                data: body
            };

            axios(config)
            .then(function (res) {
               editReset(res.data);
            })
            .catch(function (err) {
                console.log(err);
            });
        },


        resetGame: function() {

            var body = {
                
            };

            var config = {
            method: 'post',
            url: '/resetGame',
            data: body
            };

            axios(config)
            .then(function (res) {
                window.location.href = '/home';
            })
            .catch(function (err) {
                console.log(err);
            });   

        },

        goType: function() {
            window.location.href = '/type';
        },


        showLogArea: function() {
            
            return true;
        },

        showAfterLogArea: function() {
            

            return false;
        },

        resetMangaDisplay: function() {
            $('#mansearch').val('');
            $('.typecell').show();
            $('.opop').prop('checked', false);
             
        },

        changeMode: function(mode) {

            console.log("wsh what")

            if(mode == "specific") mode = this.current_type; //if client select quiz specific type

            var body = {
                val: mode
            };

            var config = {
                method: 'post',
                url: '/updateMode',
                data: body
            };

            axios(config)
            .then(function (res) {
               
            })
            .catch(function (err) {
                console.log(err);
            });   

            window.location.href = '/';
        }

        

    },

    created:  function() {
        socket.on('sessionEvent' , (uname) => {
            this.logged_user = uname;
            // console.log(this.logged_user)
            editHome(uname);
       });
    },

   
    mounted: async function() {
        
        

        socket.on('startTimerEvent' , (s_time , coanswer , playerfinalnb , plife) => {
            this.c_timer = s_time;
            this.playerlife = plife;
            this.finalAnswernb = playerfinalnb;
            startTimer(s_time , coanswer , playerfinalnb , plife);
        });  

       socket.on('successRegisterEvent' , () => {

            setTimeout(() => {
                $('.bssuccess').show();
            }, 1000);

            setTimeout(() => {
                $('.bssuccess').fadeOut();
            }, 3500);
       });

       socket.on('endForPlayer' , () => {
            updateEndPlayerData();
       });


       socket.on('displayRoomDataEvent' , (gamehost , gameusers , gameroom , roomDone) => {
            this.players = gameusers;

            if(this.logged_user == gamehost) {
           
                editRoom( gameroom);
                checkStartButton(this.playercount);

            } else editRoom2(gameroom);
                
       });


       socket.on('gameStartEvent' , () => {
            gameLaunch();  
       });


       socket.on('displayPreGame' , ( target , question , answers , difficulty , plife) => {

            this.playerlife = plife;
            this.c_question = question;
            this.answers = answers;
            preQuizAnimation(target , plife , difficulty);
       });


       socket.on('showQuestion' , (nbq , target , question , answers , difficulty , plife) => {

            $('#timetxt').fadeIn(200);
            this.playerlife = plife;
            this.c_question = question;
            this.answers = answers;
            if(target=='host') $('#nextbtnid').show();
            displayQuestion(nbq , plife , difficulty);

       });


       socket.on('allowNextQuestion' , (coanswer , finalplayernb) => {
            this.finalAnswernb = finalplayernb;
            activateNext(coanswer ,  finalplayernb);
       });

       socket.on('updateAnswer' , (uanswernb , canswer ) => {
            updateResbtn(uanswernb ,  canswer);
       });

       socket.on("finalTimeDisplay" , (finalt) => {
            if(finalt == 0) $('#timetxt').hide();
       });

       socket.on('updateFinalAnswer' , (uanswernb , canswer) => {
            finalPlayerUpdate(uanswernb , canswer);
       });


       socket.on('displayPostQuestion' , (plife) => {
            this.playerlife = plife;
            displayPostQuestionFunc(plife);
       });

       socket.on('refreshQ' , () => {
            refreshQFunc();
       });

       socket.on('showEndGame' , () => {
            showFinalResult();
       });


       socket.on('showFinalData' , (lastplayer) => {
            showLastResult(lastplayer);
       });

       socket.on('showFastest' , (fastest_player , fastest_time) => {
            showFirstPlayer(fastest_player , fastest_time); 
       });


       socket.on('displayMode' , (mode) => {
            document.getElementById('mod1').classList.remove('disablemode');
            document.getElementById('mod2').classList.remove('disablemode');
            document.getElementById('mod3').classList.remove('disablemode');

            if(mode == 'mainstream') {
                document.getElementById('mod3').classList.add('disablemode');
            
            } else if(mode == 'overall') {
                document.getElementById('mod2').classList.add('disablemode');
            } else {
                document.getElementById('mod1').classList.add('disablemode2');
            }
            
       });


    },

})





//JQUERY AND JS SECTION



//check input change
var tmp_m = document.getElementsByClassName('m_type');
var list_m = Array.prototype.slice.call(tmp_m);


$('#mansearch').on('input',function(e){

    $('.opop').prop('checked', false);
    
    var mangas = ['Naruto' , 'Fate' , 'Yu Yu Hakusho' , 'YuGiOh' , 'Dragon Ball' , 'One Piece' , 'Fairy Tail' , 'Hunter x Hunter' , 'Shingeki No Kyojin',
                'Jujutsu Kaisen' , "Jojo's Bizarre Adventure" , "My Hero Academia" , "Death Note" , "One Punch Man",
                "Demon Slayer" , "Bleach" , "Gintama" , "Fullmetal Alchemist" , "Sword Art Online" , "Pokemon" , "Kuroko no Basket" , "Nanatsu no Taizai",
                "Haikyuu" , "Code Geass" , "Openings" , "Voice"];

    var neo_mangas = mangas.map(manga => manga.toLowerCase());

    var ctype = $(this).val().toLowerCase()


    if(ctype!=" ") {

        //mangas who match the input
        var type_res = neo_mangas.filter(subtype => subtype.includes(ctype))

        //if mangas array contains a substring from ctype (input value)
        if(type_res.length > 0) {
            
            type_res.forEach(el => {
                // console.log("input res -> " , el)
            });

            //mangas who don't match the input
           var to_hide = neo_mangas.filter(el => type_res.includes(el) == false)


            var wcell = document.getElementById("wrap-cell");
            var divcell = wcell.getElementsByTagName("div");

            for (var i = 0; i < divcell.length; ++i) {
                if(to_hide.includes(divcell[i].children.item(0).innerHTML.toLowerCase()) == true) divcell[i].style.display = "none";
                else divcell[i].style.display = "unset";
            }
            

        }
    } 
    
});



$('.typecell').on('click' , function() {
    var tselect = $(this).children()[0].innerHTML;
    app.current_type = tselect;

    $(".typecell").removeClass('selectedTypeClass');
    $(this).addClass('selectedTypeClass');
    $('.typeselectedtxt').html("&nbsp; &nbsp; ᐅ &nbsp; " + tselect + " &nbsp; ᐊ")

    
    $('.subtypebtn').removeClass('subformtypedisable');
})


//mainstream
$("#op1").change(function() {

    $('#mansearch').val('');
    var wcell = document.getElementById("wrap-cell");
    var divcell = wcell.getElementsByTagName("div");
    
    if($(this).is(':checked') ){
        for (var i = 0; i < divcell.length; ++i) {
            if(divcell[i].getAttribute('name') != 'mainstream') divcell[i].style.display = "none";
            else divcell[i].style.display = "unset";
        }  
    }
});


//sport
$("#op3").change(function() {

    $('#mansearch').val('');
    var wcell = document.getElementById("wrap-cell");
    var divcell = wcell.getElementsByTagName("div");
    
    if($(this).is(':checked') ){
        for (var i = 0; i < divcell.length; ++i) {
            if(divcell[i].getAttribute('name') != 'sport') divcell[i].style.display = "none";
            else divcell[i].style.display = "unset";
        }  
    }
});


//autre
$("#op5").change(function() {

    $('#mansearch').val('');
    var wcell = document.getElementById("wrap-cell");
    var divcell = wcell.getElementsByTagName("div");
    
    if($(this).is(':checked') ){
        for (var i = 0; i < divcell.length; ++i) {
            if(divcell[i].getAttribute('name') != 'autre') divcell[i].style.display = "none";
            else divcell[i].style.display = "unset";
        }  
    }
});


$('.typecell').on('mouseenter' , function() {
    $(this).css("transform" , "scale(1.12)");
    $(this).find('img').css("filter" , "brightness(50%)")
    $(this).find('span').show();
});

$('.typecell').on('mouseleave' , function() {
    $(this).css("transform" , "scale(1)");
    $(this).find('img').css("filter" , "brightness(100%)")
    $(this).find('span').hide();
});


$('.bssuccess').on('click' , function() {
    $(this).hide();
});


$('#remail').on('click' , function() {
    $(this).attr('placeholder' , null);
});


// $('.forgotlink').on('click' , function() {
//     $('.resetmdpdiv').show();
//     $("#formdiv").hide();
//     $('#mainback').addClass('mainbright3');
// });

$('.nextbtn').prop('disabled' , true)

$('.logbtn').on('click', function() {
    $("#formdiv").slideToggle("fast" , function() {});
});


$( ".lab2 , .lab1" ).on( "click", function() {
    $("#SignInFormData").children("input").val('');
    $("#SignUpFormData").children("input").val('');
    app.showError = false;
    app.errorMsg = '';
});
    
// $('#afterlogdiv').on('click' , function() {
//     $('#profildiv').show();
// });

$('.playbtn').prop('disabled' , true);

$('.popleft').on('mouseenter' , function() {
    $('.popright').css('filter' , 'brightness(50%)');
    $(this).css('filter' , 'brightness(90%)')
});

$('.popright').on('mouseenter' , function() {
    $('.popleft').css('filter' , 'brightness(50%)');
    $(this).css('filter' , 'brightness(90%)')
});

$('.act1').on('click' , function() {
    $('.place1').prop('disabled' , false);
    $('.place1').css('background-color', 'azure');
})

$('.act2').on('click' , function() {
    $('.place2').prop('disabled' , false);
    $('.place2').css('background-color', 'azure');
})

$('.act3').on('click' , function() {
    $('.place3').prop('disabled' , false);
    $('.place3').css('background-color', 'azure');
    $('.newmdpdiv').show();
})

$('.act4').on('click' , function() {
    $('.place5').prop('disabled' , false);
    $('.place5').css('background-color', 'azure');
})

$('.btnres').on('mouseenter' , function() {
    $(this).addClass('btnreshover');
});

$('.btnres').on('mouseleave' , function() {
    $(this).removeClass('btnreshover');
});


if(document.getElementById('generalpop')) {
    var boxpop = document.getElementById('generalpop');
    boxpop.addEventListener('mouseleave' , () => {
       document.getElementById('pop1').style.filter = 'brightness(90%)';
       document.getElementById('pop2').style.filter = 'brightness(90%)';
    });
}


// if(document.getElementById('logogo')) {
//     if(window.innerWidth < 432) {
//         $('#logogo').text('Anime Prodigy');
//     }
// }





document.addEventListener('click', function handleClickOutsideBox(event) {
    const box = document.getElementById('formdiv');

    if(document.getElementById('logdiv')!=null) {
        const boxbtn = document.getElementById('logdiv');

        if (!box.contains(event.target) && !boxbtn.contains(event.target)) {
        box.style.display = 'none';
        $("#SignInFormData").children("input").val('');
        $("#SignUpFormData").children("input").val('');
        app.showError = false;
        app.errorMsg = '';
        }
    }
  });

  document.addEventListener('click', function handleClickOutsideBox(event) {

    if(document.getElementById('afterlogdiv')!=null) {
        const box = document.getElementById('profildiv');
        const boxbtn = document.getElementById('afterlogdiv');
    
        if (!box.contains(event.target) && !boxbtn.contains(event.target)) {
            box.style.display = 'none';
        }
    }
  });


function passError(err) {
    app.editError(err);
}

function SuccLog(uname) {
    window.location.reload();
    
}

function SuccSign() {
    window.location.reload();
}

function SuccCreate(rid) {
    window.location.href = '/play';
}

function SuccJoin(userjoin) {
    window.location.href = '/play';
}

function editHome(username) {
    var v = document.getElementById('userdata');
    var vv = username;
    if(v!=null) v.textContent = vv.charAt(0);

    $('.playbtn').prop('disabled' , false);

    $('.playbtn').on('mouseenter' , function() {
        $(this).addClass('playbtnclass');
    });

    $('.playbtn').on('mouseleave' , function() {
        $(this).removeClass('playbtnclass');
    });

    app.logged_user = username;

    if(app.logged_user != 'SLAYER' && app.logged_user != 'slayer'&& app.logged_user != 'admin' && app.logged_user != 'ADMIN') {
        $('#createbtn').prop('disabled' , true);
        $('.popright').attr('title' , 'Available Soon');
        $('.popright').css('cursor' , 'not-allowed');
        $('#createbtn').css('cursor' , 'not-allowed');

        $('.popright').on('mouseenter' , function() {
            $('.infobulle2').addClass('infobulle2class');
        });

        $('.popright').on('mouseleave' , function() {
            $('.infobulle2').removeClass('infobulle2class');
        });

    }   

    $(".place1").attr("placeholder", username);

}


// first display loading
function editRoom(roomid) {
    $('.playerdiv').show();
    
    setTimeout(() => {
        $('.creatediv').fadeIn(100);
        $('.creatediv').removeClass('transform-out4').addClass('transform-in4');
    }, 200);  

    setTimeout(() => {
        $('#startbtn').fadeIn(100);
        $('#startbtn').removeClass('transform-out4').addClass('transform-in4');
    }, 200); 
    
    app.croomID = roomid;
    var v = document.getElementById('tmptxtroom');
    if(v!=null) v.textContent =  roomid;
    app.playercount = app.players.length;
}


//display for all players except host
function editRoom2(roomid) {
    app.croomID = roomid;
    app.playercount = app.players.length;

    $('.waitdiv').fadeIn(100);
    $('.loader').show();
    $('.waitdiv').removeClass('transform-out4').addClass('transform-in4');
    // $('.waitdiv').addClass('tmpshake2');


}

$('.popup-btn').on('click' , function(e) {
    $('.popup-wrap').fadeIn(100);
    $('.popup-box').removeClass('transform-out').addClass('transform-in');
    $('#mainback').addClass('mainbright');
    e.preventDefault();
  });

  function closePopup() {
    $('#mainback').removeClass('mainbright');
    $('.popup-wrap').fadeOut(100);
    $('.popup-box').removeClass('transform-in').addClass('transform-out');
  }

  //close popup when click anywhere else
  document.addEventListener('click', function handleClickOutsideBox2(event) {

    if(document.getElementById('popup')!=null) {
        const popbox = document.getElementById('popup');
        const playbtn = document.getElementById('playbtndiv');
        const codebox = document.getElementById('popupcode');
        const resetbox = document.getElementById('resetdivid');
        const resetlinkbox = document.getElementById('flinkid');

        if(resetbox == null || resetlinkbox == null) {
    
            if (!popbox.contains(event.target) && !playbtn.contains(event.target) && !codebox.contains(event.target)) {
                closePopup();
            }

        } else {

            if (!resetbox.contains(event.target) && !resetlinkbox.contains(event.target) &&  !popbox.contains(event.target) && !playbtn.contains(event.target) && !codebox.contains(event.target)) {
                closePopup();
            }

        }
    }

  });


document.addEventListener('click' , function handleClickOutsideBox3(event) {

    if(document.getElementById('popupcode')!=null) {
        const codebox = document.getElementById('popupcode');
        const popbox = document.getElementById('popup');

        if (!codebox.contains(event.target) && !popbox.contains(event.target)) {
            $('.codewrap').hide();
            $('.codediv').fadeOut(100);
            $('.codediv').removeClass('transform-in2').addClass('transform-out2');
        }
    }

});




document.addEventListener('click' , function hideForgetArea(event) {

    if(document.getElementById('resetdivid')!=null) {
        const resetbox = document.getElementById('resetdivid');
        const resetlinkbox = document.getElementById('flinkid');

        if(!resetbox.contains(event.target) && !resetlinkbox.contains(event.target)) {
           
            $('#remail').val(null);
            $("#remail").attr('placeholder' , "Ton Mail..");
            $('#mainback').removeClass('mainbright3');
            $('#resetdivid').fadeOut(10);
            $('.reseterrorpic').hide();
            $('.succresetpic').hide();
        }
        
    }

});


function errorCodeInput() {
    $('#inputroom').addClass('tmpshake');
    $("#codebtn").animate({'background-color': '#e26381'}, 400);
    setTimeout(function(){
        $('#inputroom').removeClass('tmpshake');
     },300);    
     $("#inputroom").trigger('blur'); 
}

function resetBackInput() {
    $('#codebtn').css('background-color' , "#97731f96" );
}


function copyCode() {
    var tmpinput = document.createElement("input");
    tmpinput.value = app.croomID;
    document.body.appendChild(tmpinput);
    tmpinput.select();
    
    document.execCommand("copy");
    document.body.removeChild(tmpinput);
    
}

// COMMENCER LA PARTIE QUAND IL Y A MINIMUM 1 JOUEUR (OU PLUS NBP)
function checkStartButton(nbp) {
//    if(nbp < 1) {
//     $('.start-game-btn').prop('disabled' , true);
//    } else {
//     $('.start-game-btn').prop('disabled' , false);
//    }
}


//host redirection to quiz
function gameRedirect() {
    location.href = '/quiz';
}

//player except host rediction to quiz
function gameLaunch() {
    window.location.href = "/quiz";
}


function preQuizAnimation(target , plife , difficulty) {

        if(difficulty == "Very easy") $('#diffimgid').prop('src' , 'veryeasy2.png');
        if(difficulty == "Easy") $('#diffimgid').prop('src' , 'easy2.png');
        if(difficulty == "Medium") $('#diffimgid').prop('src' , 'medium2.png');
        if(difficulty == "Hard") $('#diffimgid').prop('src' , 'hard2.png');
        if(difficulty == "Very Hard") $('#diffimgid').prop('src' , 'veryhard2.png');
        if(difficulty == "Extreme") $('#diffimgid').prop('src' , 'extreme.png');

        $(".shinpic").show();
        $('.shinpic').addClass('shinpic_animation1');
        setTimeout(() => {
            $('.shinpic').removeClass('shinpic_animation1');
            $('.shinpic').addClass('shinpic_animation2');
        }, 900);

        
        setTimeout(() => {
            $(".progressbarwrap").fadeIn(300);
        }, 800);

        var load_info_text = document.getElementById('infoload');

        setTimeout(() => {
            load_info_text.innerHTML = "Questions en cours de création";
        }, 1000);

        setTimeout(() => {
            load_info_text.innerHTML = "Importation des questions";
        }, 1500);

        setTimeout(() => {
            load_info_text.innerHTML = "Maintenance du package principal";
        }, 2200);

        setTimeout(() => {
            load_info_text.innerHTML = "Transfert des joueurs";
        }, 2600);

        setTimeout(() => {
            load_info_text.innerHTML = "Lancement de la partie";
        }, 3000);

        setTimeout(() => {
            $('.shinpic').removeClass('shinpic_animation2');
            $('.shinpic').fadeOut(500);
            $(".progressbarwrap").fadeOut(300);
        }, 3500);

        setTimeout(() => {
            $('.lifediv').show();

            if(plife == 3) {
                $('.lifediv img:first-child').show();
                $('.lifediv img:nth-child(2)').show();
                $('.lifediv img:nth-child(3)').show();
            }

            if(plife == 2) {
                $('.lifediv img:first-child').show();
                $('.lifediv img:nth-child(2)').show();
            }

            if(plife == 1) {
                $('.lifediv img:first-child').show();
            }


        }, 4300);
         
        setTimeout(() => {
            displayQuestion(1  , this.playerlife);
        }, 5000);

        setTimeout(() => {
            if(target == 'host') $('.nextbtn').fadeIn(900);
        }, 6000);

        setTimeout(() => {
            $('#timetxt').fadeIn(700);
        }, 6500);
        


}


//click on shin pic
function displayShinData() {

    console.log("lol");
    
}


function displayQuestion(nbp , plife , difficulty) {
    
    if(difficulty == "Very easy") $('#diffimgid').prop('src' , 'veryeasy2.png');
    if(difficulty == "Easy") $('#diffimgid').prop('src' , 'easy2.png');
    if(difficulty == "Medium") $('#diffimgid').prop('src' , 'medium2.png');
    if(difficulty == "Hard") $('#diffimgid').prop('src' , 'hard2.png');
    if(difficulty == "Very Hard") $('#diffimgid').prop('src' , 'veryhard2.png');
    if(difficulty == "Extreme") $('#diffimgid').prop('src' , 'extreme.png');
    

    if(plife <= 0) {
        $('.btnres').prop('disabled' , true);
        $('.btnres').removeClass('btnreshover');
        $(".btnres").unbind('mouseenter');
        $('.btnres').addClass('lifelessclass');
        $('.btnres').css('cursor' , 'default');
    }

    var answers = app.answers;
    var the_question = app.c_question;

    $('.lifediv').show();


    if(plife == 3) {
        $('.lifediv img:first-child').show();
        $('.lifediv img:nth-child(2)').show();
        $('.lifediv img:nth-child(3)').show();
    }

    if(plife == 2) {
        $('.lifediv img:first-child').show();
        $('.lifediv img:nth-child(2)').show();
    }

    if(plife == 1) {
        $('.lifediv img:first-child').show();
    }


    $('.shinpic').hide();
    $('.bloc').show();

    document.getElementById('mainquestion').textContent = the_question;
    document.getElementById('answer1btn').textContent = answers[0];
    document.getElementById('answer2btn').textContent = answers[1];
    document.getElementById('answer3btn').textContent = answers[2];
    document.getElementById('answer4btn').textContent = answers[3];
    document.getElementById('headquestion').innerHTML = "Question " + nbp;

    $('.titlequestiondiv').show();

    setTimeout(() => {
        $('.questiondiv').show();
    }, 1000);
}



function updateResbtn(player_answernb  , correct_answer) {
    var res_nb;
    for(ans in app.answers) {
        if(ans == player_answernb-1) res_nb = ans;
    }

    if(res_nb == 0) {
        document.getElementById("answer1btn").classList.add("selectclass");
        $('.imgres1').addClass('imgresanim');
        $('#answer2btn').prop('disabled' , true);
        $('#answer3btn').prop('disabled' , true);
        $('#answer4btn').prop('disabled' , true);
        $("#answer2btn").unbind('mouseenter');
        $("#answer3btn").unbind('mouseenter');
        $("#answer4btn").unbind('mouseenter');               
    }

    if(res_nb == 1) {
        document.getElementById("answer2btn").classList.add("selectclass");
        $('.imgres2').addClass('imgresanim');
        $('#answer1btn').prop('disabled' , true);
        $('#answer3btn').prop('disabled' , true);
        $('#answer4btn').prop('disabled' , true);
        $("#answer1btn").unbind('mouseenter');
        $("#answer3btn").unbind('mouseenter');
        $("#answer4btn").unbind('mouseenter');                       
    }

    if(res_nb == 2) {
        document.getElementById("answer3btn").classList.add("selectclass");
        $('.imgres3').addClass('imgresanim');
        $('#answer1btn').prop('disabled' , true);
        $('#answer2btn').prop('disabled' , true);
        $('#answer4btn').prop('disabled' , true);
        $("#answer1btn").unbind('mouseenter');
        $("#answer2btn").unbind('mouseenter');
        $("#answer4btn").unbind('mouseenter');               
    }

    if(res_nb == 3) {
        document.getElementById("answer4btn").classList.add("selectclass");
        $('.imgres4').addClass('imgresanim');
        $('#answer1btn').prop('disabled' , true);
        $('#answer2btn').prop('disabled' , true);
        $('#answer3btn').prop('disabled' , true);
        $("#answer1btn").unbind('mouseenter');
        $("#answer2btn").unbind('mouseenter');
        $("#answer3btn").unbind('mouseenter');               
    }        

}


function startTimer(uptimer , coanswer , playernbanswer , plife) {
    
    var vv = setInterval(() => {
        
        uptimer--;

        if(uptimer >= 0) $('#timetxt').text(uptimer + "");
        if(uptimer <=3) document.getElementById('timetxt').style.color = 'hotpink';   
        
        if(uptimer == 0) {

            activateNext(coanswer , playernbanswer);
            
            //display post answer messages to client after timer ended
            if(coanswer == app.finalAnswernb) {
                $('.spananswermsg').html('Bien joué !');
                $('.infobulle').css('background-color' , "#7ce3f6f9" );
            } else {

                if(app.finalAnswernb != null) {
                    $('.spananswermsg').html('Raté..');
                    $('.infobulle').css('background-color' , "#f68ec5f9" );
                    
                    if(plife == 3) {
                        $('#lifeid').children().last().remove();
                    }

                    if(plife == 2) {
                        $('#lifeid').children().last().remove();
                        $('#lifeid').children().last().remove();
                    }

                    if(plife == 1) {
                        $('#lifeid').children().last().remove();
                        $('#lifeid').children().last().remove();
                        $('#lifeid').children().last().remove();
                    }


                    //no answer
                } else {

                    validateNoAnswer()
                    if(plife>0) $('.spananswermsg').html("AFK ?");
                    $('.infobulle').css('background-color' , "#e6e99e" );

                    if(plife == 3) {
                        $('#lifeid').children().last().remove();
                    }

                    if(plife == 2) {
                        $('#lifeid').children().last().remove();
                        $('#lifeid').children().last().remove();
                    }

                    if(plife == 1) {
                        $('#lifeid').children().last().remove();
                        $('#lifeid').children().last().remove();
                        $('#lifeid').children().last().remove();
                    }
                    
                }

                removeLifeServer();
            }

            if(plife > 0) {
                $('.infobulle').css('opacity' , 1);
                $('.infobulle').css('left' , "-15px");
                $('.infobulle').css('top' , "-50px");
            }

            clearInterval(vv);
        
        }
        
    }, 1000);

}

//host case -> at the end of the timer : activate pass button , hide timer and then show correct and false answers
//player case (called once) -> at the end of the timer : hide timer and then show correct and false answers 
function activateNext(correct_answer , playernbanswer) {

    $('.nextbtn').prop('disabled' , false);

    $('.nextbtn').on('mouseenter' , function() {
        $(this).addClass('nextbtnhover');
    });

    $('.nextbtn').on('mouseleave' , function() {
        $(this).removeClass('nextbtnhover');
    });

    $('#timetxt').fadeOut(600);

    ///// SHOW WRONG AND RIGHT ANSWER

    if(correct_answer == 1) $('#answer1btn').addClass("correctanswerclass");
    if(correct_answer == 2) $('#answer2btn').addClass("correctanswerclass");
    if(correct_answer == 3) $('#answer3btn').addClass("correctanswerclass");
    if(correct_answer == 4) $('#answer4btn').addClass("correctanswerclass");
    $('.btnres').removeClass('btnreshover');
    

    //if player choosed an answer
    if(app.finalAnswernb != null) {

        //player answer different than correct answer
        if(app.finalAnswernb != correct_answer) {

           $('.btnres').removeClass('btnreshover');
           $(".btnres").unbind('mouseenter');
           $('.btnres').css('cursor' , 'default');

           //TODO : check to red here (remove select class and add wrongclass) 

           if(app.finalAnswernb == 1) {
                $('#answer1btn').removeClass('selectclass');
                $('#answer1btn').addClass('wronganswerclass');
           }

           if(app.finalAnswernb == 2) {
                $('#answer2btn').removeClass('selectclass');
                $('#answer2btn').addClass('wronganswerclass');
           }

           if(app.finalAnswernb == 3) {
                $('#answer3btn').removeClass('selectclass');
                $('#answer3btn').addClass('wronganswerclass');
           }

           if(app.finalAnswernb == 4) {
                $('#answer4btn').removeClass('selectclass');
                $('#answer4btn').addClass('wronganswerclass');
           }
           

        }

    } else {

        if(correct_answer == 1) $('#answer1btn').removeClass('selectclass');
        if(correct_answer == 2) $('#answer1btn').removeClass('selectclass');
        if(correct_answer == 3) $('#answer1btn').removeClass('selectclass');
        if(correct_answer == 4) $('#answer1btn').removeClass('selectclass');

        $('#answer1btn').prop('disabled' , true);
        $('#answer2btn').prop('disabled' , true);
        $('#answer3btn').prop('disabled' , true);
        $('#answer4btn').prop('disabled' , true);

        $(".btnres").unbind('mouseenter');
        $('.btnres').removeClass('btnreshover');

    }


}



function finalPlayerUpdate(coanswer , correct_answer) {

    if(correct_answer == 1) $('#answer1btn').addClass("correctanswerclass");
    if(correct_answer == 2) $('#answer2btn').addClass("correctanswerclass");
    if(correct_answer == 3) $('#answer3btn').addClass("correctanswerclass");
    if(correct_answer == 4) $('#answer4btn').addClass("correctanswerclass");

    $('.btnres').prop('disabled' , true);
    $(".btnres").unbind('mouseenter');
    $('.btnres').removeClass('btnreshover'); 

    if(coanswer == 1) {
        document.getElementById("answer1btn").classList.add("selectclass");
        $('.imgres1').addClass('imgresanim');   
    }

    if(coanswer == 2) {
        document.getElementById("answer2btn").classList.add("selectclass");
        $('.imgres2').addClass('imgresanim');                   
    }

    if(coanswer == 3) {
        document.getElementById("answer3btn").classList.add("selectclass");
        $('.imgres3').addClass('imgresanim');             
    }

    if(coanswer == 4) {
        document.getElementById("answer4btn").classList.add("selectclass");
        $('.imgres4').addClass('imgresanim');
    }

    
    if(coanswer == null) {
        
        $('.btnres').prop('disabled', true);
        $(".btnres").unbind('mouseenter');
        $('.btnres').removeClass('btnreshover');
    } else {

        if(app.finalAnswernb != correct_answer) {
            if(app.finalAnswernb == 1) {
                $('#answer1btn').removeClass('selectclass');
                $('#answer1btn').addClass('wronganswerclass');
           }

           if(app.finalAnswernb == 2) {
                $('#answer2btn').removeClass('selectclass');
                $('#answer2btn').addClass('wronganswerclass');
           }

           if(app.finalAnswernb == 3) {
                $('#answer3btn').removeClass('selectclass');
                $('#answer3btn').addClass('wronganswerclass');
           }

           if(app.finalAnswernb == 4) {
                $('#answer4btn').removeClass('selectclass');
                $('#answer4btn').addClass('wronganswerclass');
           }
        }

    }

}


// au cas ou : function pour afficher question et reponse apres la fin du timer 
function displayPostQuestionFunc(plife) {

    $('.lifediv').show();

    if(plife == 3) {
        $('.lifediv img:first-child').show();
        $('.lifediv img:nth-child(2)').show();
        $('.lifediv img:nth-child(3)').show();
    }

    if(plife == 2) {
        $('.lifediv img:first-child').show();
        $('.lifediv img:nth-child(2)').show();
    }

    if(plife == 1) {
        $('.lifediv img:first-child').show();
    }


    $('.bloc').show();
    $('#nextbtnid').show();
    $('#nextbtnid').prop('disabled' , false);
    
    $('.nextbtn').on('mouseenter' , function() {
        $(this).addClass('nextbtnhover');
    });

    $('.nextbtn').on('mouseleave' , function() {
        $(this).removeClass('nextbtnhover');
    });


}


function removeLifeServer() {

    var body = {
        val : 1,
    };

    var config = {
        method: 'post',
        url: '/lifeRemove',
        data: body
    };

    axios(config)
    .then(function (res) {
    })
    .catch(function (err) {
        console.log(err);
    });  

}


function refreshQFunc() {

    var body = {
        val :'',
    };

    var config = {
        method: 'post',
        url: '/resetAnswerPlayer',
        data: body
    };

    axios(config)
    .then(function (res) {
        window.location.href = '/quiz';
    })
    .catch(function (err) {
        console.log(err);
    });

}


function showFinalResult() {

    var body = {
        val :'',
    };

    var config = {
        method: 'post',
        url: '/endGame',
        data: body
    };

    axios(config)
    .then(function (res) {
        window.location.href = '/endGame';
    })
    .catch(function (err) {
        console.log(err);
    });


}


function editReset(rdata) {

    if(rdata == 'good') {
        $('#remail').removeClass('tmpshake');
        $('.reseterrorpic').hide();
        $('.succresetpic').show();
    } else {
        $('#remail').addClass('tmpshake');
        setTimeout(function(){
            $('#remail').removeClass('tmpshake');
         },300);  
        $('.succresetpic').hide();
        $('.reseterrorpic').show();
    }


}


function showLastResult(lastplayer) {

    $('#lastdiv').show();
    document.getElementById('lasptxt').innerHTML = lastplayer + " EST LE VAINQUEUR !";

}


function updateEndPlayerData() {

    var body = {
        val :'',
    };

    var config = {
        method: 'post',
        url: '/updatePlayerEndgame',
        data: body
    };

    axios(config)
    .then(function (res) {
        
    })
    .catch(function (err) {
        console.log(err);
    });

}



function showFirstPlayer(name , time) {

    if(window.innerWidth < 432) {
        $('#fasttxt').text(name + " A ÉTÉ LE PLUS RAPIDE : " + time + "sec");
        $('#fasttxt').css('font-size' ,  '2.2vmin');
    } else {
        $('#fasttxt').text(name + " A ÉTÉ LE PLUS RAPIDE : " + time + "s");
    }


    $('.fastdiv').fadeIn();
    

}



function validateNoAnswer() {

    var body = {
        val:''
    };

    var config = {
        method: 'post',
        url: '/validateAnswer',
        data: body
    };

    axios(config)
    .then(function (res) {
        // gameRedirect();
    })
    .catch(function (err) {
        console.log(err);
    });

}


















