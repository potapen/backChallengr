window.addEventListener("DOMContentLoaded", async (event) => { //otherwise the DOM is not loaded and menuButton returns null
    console.log("DOM entièrement chargé et analysé");
    const navTopElt = document.querySelector('#myTopnav');
    const menuButton = document.querySelector('#menuButton');
    //permet d'animer le menu de navigation
    const menuClick = (event)=>{
        if (navTopElt.className === "topnav") {
            navTopElt.className += " responsive";
          } else {
            navTopElt.className = "topnav";
          }
    }
    menuButton.addEventListener('click', menuClick);
  });
