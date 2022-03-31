console.log('this is layout.js')


const labels = [];
const data = {};
// const labels = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
// ];

// const data = {
//   labels: labels,
//   datasets: [{
//     label: 'My First dataset',
//     backgroundColor: 'rgb(255, 99, 132)',
//     borderColor: 'rgb(255, 99, 132)',
//     data: [0, 10, 5, 2, 20, 30, 45],
//   }]
// };

const config = {
  type: 'line',
  data: data,
  options: {}
};
async function getOneRegister () {
  const response = await axios({ //we need to return a promise
    method: 'GET',
    url: 'http://localhost:3000/challenge'
  })
  console.log('-------------------------------response.data: ', response.data)
  return response.data
};

async function getUsersFromLeague (leagueID) {
  console.log('getUsersFromLeague')
  const response = await axios({ //we need to return a promise
    method: 'GET',
    baseURL: 'http://localhost:3000/boards/stats/',
    url: leagueID,
  });
  const membersObjArray = response.data.members
  return membersObjArray
};

window.addEventListener("DOMContentLoaded", async (event) => { //otherwise the DOM is not loaded and menuButton returns null
    console.log("DOM entièrement chargé et analysé");
    const menuButton = document.querySelector('#menuButton');
    const navTopElt = document.querySelector('#myTopnav');
    const nameSelectElt = document.querySelector('#nameSelect');

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




    const data = await getOneRegister();
    const myChart = new Chart(
      document.getElementById('myChart'),
      config
    );
    const leagueSelectElt = document.querySelector('#leagueSelect');

    const leagueSelectClick = async (event)=>{
      const leagueID = leagueSelectElt.value;
      if(leagueID){
        console.log('leagueID: ', leagueID);
        const membersObjArray = await getUsersFromLeague(leagueID);
        // console.log('leagueSelectClick membersObjArray',membersObjArray )
        nameSelectElt.innerHTML = "";
        membersObjArray.forEach(obj => {
          console.log(obj);
          const optionElt = document.createElement('option');
          optionElt.value = obj._id;
          optionElt.innerText = obj.username;
          nameSelectElt.appendChild(optionElt);
          }
        )
      }
    }
    leagueSelectElt.addEventListener('click', leagueSelectClick);
  });

