console.log('this is layout.js')
window.addEventListener("DOMContentLoaded", (event) => { //otherwise the DOM is not loaded and menuButton returns null
    console.log("DOM entièrement chargé et analysé");
    const menuButton = document.querySelector('#menuButton')
    const navTopElt = document.querySelector('#myTopnav')
    const menuClick = (event)=>{
        // console.log('click on menu event ', event)
        console.log('navTopElt.className :', navTopElt.className)
        if (navTopElt.className === "topnav") {
            navTopElt.className += " responsive";
          } else {
            navTopElt.className = "topnav";
          }
    }
    menuButton.addEventListener('click', menuClick)
  });

