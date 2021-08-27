   // Credit: nolittleplans https://imgur.com/gallery/qn0mbNQ
   const pictures = ["darkblueskydock.jpeg", "cityroad.jpg", "purplemountains.jpg", "earthoceancloud.jpg", "sanddune.jpg", "sparklefiber.jpg", "nightmountains.jpg", "redtreelake.jpg", "taffyswirl.jpg", "desertfence.jpg", "skateboard.jpg", "intersection.jpg", "rainystreet.jpg", "blueredmoon.jpg", "bluespaceice.jpg", "blackyellowstairs.jpg", "blobswirlpurplewhite.jpg", "redplanet.jpg", "campervannight.jpg", "darthvader.png", "deathstar.jpg", "tentstarrynight.jpg", "stonenightlake.jpg", "lightdarkocean.jpg", "smallboatlake.jpg", "firevinylpaint.jpg", "nightroadheadlight.jpg", "dusknewyork.jpg", "darkoceanisland.jpg", "citynightheadlight.jpg", "fognightcity.jpg", "castleonmountain.jpg", "metallspikeball.jpg", "nightalleyway.jpg", "catknight.jpg", "sharpoceanrock.jpg", "bluemountain.jpg", "mountainlookout.jpg", "purpleredplanet.jpg", "nightfields.jpg", "wetroadnight.jpg"]
       // "japanwavedrawing.jpg"

   startImageTransition();


   async function startImageTransition() {

       var top = -5;
       let curr_image = document.getElementById('background-img-top');
       let old_image = document.getElementById('background-img-back');
       curr_image.childNodes[0].style.opacity = 1;
       old_image.childNodes[0].style.opacity = 1;

       setInterval(changeBackgroundImage, 10000);

       async function changeBackgroundImage() {

           curr_image.style.zIndex = top + 1;
           await sleep(300);
           old_image.style.zIndex = top;
           await sleep(300);

           old_image.childNodes[0].src = `backgrounds/${pictures[Math.floor(Math.random() * pictures.length)]}`;

           console.log(old_image.childNodes[0].src)

           await transition(curr_image);
           await sleep(300);
           curr_image.style.zIndex = top - 2;
           await sleep(300);
           curr_image.childNodes[0].style.opacity = 1;
           // switch curr and old image
           [curr_image, old_image] = [old_image, curr_image];
       }

       function transition(image) {
           return new Promise(function(resolve, reject) {

               var del = 0.01;
               var id = setInterval(changeOpacity, 10);

               function changeOpacity() {
                   image.childNodes[0].style.opacity -= del;
                   if (image.childNodes[0].style.opacity <= 0) {
                       clearInterval(id);
                       resolve();
                   }
               }


           })
       }


   }