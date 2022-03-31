window.addEventListener("DOMContentLoaded", async (event) => { //otherwise the DOM is not loaded and menuButton returns null
    console.log("DOM entièrement chargé et analysé");
    const navTopElt = document.querySelector('#myTopnav');
    const menuButton = document.querySelector('#menuButton');
    const menuClick = (event)=>{
        // console.log('click on menu event ', event)
        console.log('navTopElt.className :', navTopElt.className)
        if (navTopElt.className === "topnav") {
            navTopElt.className += " responsive";
          } else {
            navTopElt.className = "topnav";
          }
    }
    menuButton.addEventListener('click', menuClick);
  });